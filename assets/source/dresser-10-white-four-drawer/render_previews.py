"""Детерминированный CPU raster preview реального GLB, без browser/Blender.

Не заменяет финальную WebGL/Blender проверку. Геометрия читается из GLB;
transforms и texture repeat/offset берутся из preview-states.json,
полученного неизменёнными production controllers.
Python 3 + numpy + scipy + Pillow.
"""
import io
import json
import math
import struct
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.ndimage import gaussian_filter

SOURCE = Path(__file__).resolve().parent
SPEC = json.loads((SOURCE/'model-spec.json').read_text())
STATE_DATA = json.loads((SOURCE/'preview-states.json').read_text())
GLB = SOURCE.parents[2]/'public/models'/f"{SPEC['id']}.glb"
raw=GLB.read_bytes()
json_size=struct.unpack_from('<I',raw,12)[0]
gltf=json.loads(raw[20:20+json_size])
blob=raw[28+json_size:]
DTYPES={5126:'<f4',5125:'<u4',5123:'<u2',5121:'u1'}
COUNTS={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}

def accessor(i):
    a=gltf['accessors'][i];v=gltf['bufferViews'][a['bufferView']]
    dtype=np.dtype(DTYPES[a['componentType']]);n=COUNTS[a['type']]
    start=v.get('byteOffset',0)+a.get('byteOffset',0)
    stride=v.get('byteStride',n*dtype.itemsize)
    return np.ndarray((a['count'],n),dtype=dtype,buffer=blob,offset=start,strides=(stride,dtype.itemsize)).copy()

def normalize(v):
    return v/np.maximum(np.linalg.norm(v,axis=-1,keepdims=True),1e-12)

def camera(eye,target,span,w,h):
    eye=np.array(eye,float);forward=normalize(np.array(target)-eye)
    right=normalize(np.cross(forward,[0,1,0]));up=np.cross(right,forward)
    def project(p):
        q=p-eye
        return np.stack(((q@right/(span*w/h)+0.5)*w,(0.5-q@up/span)*h,q@forward),-1)
    return project,eye

def geometry(state):
    result=[]
    for node in gltf['nodes']:
        if 'mesh' not in node:continue
        if not state['nodes'][node['name']].get('visible',True):continue
        matrix=np.array(state['nodes'][node['name']]['matrixWorld']).reshape(4,4).T
        normal_matrix=np.linalg.inv(matrix[:3,:3]).T
        for p in gltf['meshes'][node['mesh']]['primitives']:
            a=p['attributes'];pos=accessor(a['POSITION']);normal=accessor(a['NORMAL'])
            pos=np.column_stack((pos,np.ones(len(pos))))@matrix.T
            uv=accessor(a['TEXCOORD_0']) if 'TEXCOORD_0' in a else np.zeros((len(pos),2))
            tangent=accessor(a['TANGENT']) if 'TANGENT' in a else np.zeros((len(pos),4))
            tangent[:,:3]=normalize(tangent[:,:3]@matrix[:3,:3].T)
            result.append(dict(p=pos[:,:3],n=normalize(normal@normal_matrix.T),uv=uv,t=tangent,idx=accessor(p['indices']).reshape(-1,3).astype(int),m=p['material']))
    return result

def raster(meshes,project,w,h,attributes=True):
    depth=np.full((h,w),np.inf,np.float32)
    normal=np.zeros((h,w,3),np.float32);world=np.zeros_like(normal)
    uv=np.zeros((h,w,2),np.float32);tangent=np.zeros((h,w,4),np.float32)
    ids=np.full((h,w),-1,np.int16)
    for mesh in meshes:
        xy=project(mesh['p'])
        for face in mesh['idx']:
            pts=xy[face];a,b,c=pts
            left=max(0,math.floor(min(pts[:,0])));right=min(w-1,math.ceil(max(pts[:,0])))
            top=max(0,math.floor(min(pts[:,1])));bottom=min(h-1,math.ceil(max(pts[:,1])))
            if left>right or top>bottom:continue
            den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
            if abs(den)<1e-9:continue
            xx,yy=np.meshgrid(np.arange(left,right+1)+0.5,np.arange(top,bottom+1)+0.5)
            u=((b[1]-c[1])*(xx-c[0])+(c[0]-b[0])*(yy-c[1]))/den
            v=((c[1]-a[1])*(xx-c[0])+(a[0]-c[0])*(yy-c[1]))/den
            z=1-u-v
            zz=u*a[2]+v*b[2]+z*c[2]
            ds=depth[top:bottom+1,left:right+1]
            mask=(u>=-1e-6)&(v>=-1e-6)&(z>=-1e-6)&(zz<ds)
            if not np.any(mask):continue
            ds[mask]=zz[mask]
            if not attributes:continue
            weights=np.stack((u[mask],v[mask],z[mask]),-1)
            for dest,key in [(normal,'n'),(world,'p'),(uv,'uv'),(tangent,'t')]:
                dest[top:bottom+1,left:right+1][mask]=weights@mesh[key][face]
            ids[top:bottom+1,left:right+1][mask]=mesh['m']
    return depth,normal,world,uv,tangent,ids

images=[]
for entry in gltf['images']:
    if 'uri' in entry:
        image_path=(GLB.parent/entry['uri']).resolve()
        image_path.relative_to((SOURCE.parents[2]/'public').resolve())
        image=Image.open(image_path).convert('RGB')
    else:
        v=gltf['bufferViews'][entry['bufferView']]
        image=Image.open(io.BytesIO(blob[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']])).convert('RGB')
    images.append(np.array(image,dtype=np.float32)/255)

def sample(texture_index,uv):
    im=images[gltf['textures'][texture_index]['source']];h,w=im.shape[:2]
    x=(uv[:,0]%1)*w-0.5;y=(uv[:,1]%1)*h-0.5
    xi=np.floor(x).astype(int);yi=np.floor(y).astype(int);fx=(x-xi)[:,None];fy=(y-yi)[:,None]
    return ((im[yi%h,xi%w]*(1-fx)+im[yi%h,(xi+1)%w]*fx)*(1-fy)+(im[(yi+1)%h,xi%w]*(1-fx)+im[(yi+1)%h,(xi+1)%w]*fx)*fy)

finish_images={}
def sample_finish(finish,key,uv):
    filename=finish['maps'][key]
    if filename not in finish_images:
        p=SOURCE.parents[2]/'public'/filename.lstrip('/')
        finish_images[filename]=np.array(Image.open(p).convert('RGB'),dtype=np.float32)/255
    im=finish_images[filename];h,w=im.shape[:2]
    x=(uv[:,0]%1)*w-.5;y=(uv[:,1]%1)*h-.5
    xi=np.floor(x).astype(int);yi=np.floor(y).astype(int);fx=(x-xi)[:,None];fy=(y-yi)[:,None]
    return ((im[yi%h,xi%w]*(1-fx)+im[yi%h,(xi+1)%w]*fx)*(1-fy)+(im[(yi+1)%h,xi%w]*(1-fx)+im[(yi+1)%h,(xi+1)%w]*fx)*fy)

def linear(c):return np.where(c<=0.04045,c/12.92,((c+0.055)/1.055)**2.4)
def srgb(c):return np.where(c<=0.0031308,c*12.92,1.055*np.maximum(c,0)**(1/2.4)-0.055)
def aces(x):return np.clip((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0,1)

def render(state,view='main',w=1100,h=900):
    meshes=geometry(state)
    target=[0,SPEC['limits']['height'][1]*.46,0]
    span=max(SPEC['limits']['height'][1]*1.38,SPEC['limits']['width'][1]*.80+.35)
    if 'open' in state['name']:span*=1.12
    ht=target[1]
    eyes={'main':[-3,ht+1.75,6],'front':[0,ht+1.2,6],'right':[5,ht+1.5,0],'back':[0,ht+1.5,-5],'left':[-5,ht+1.5,0],'under':[1,-1,2]}
    if 'open' in state['name']:eyes['main']=[-3,ht+2.3,6]
    eye=eyes[view]
    project,eye=camera(eye,target,span,w,h)
    light_project,_=camera([-3.5,5,4],target,max(3,span*1.4),1200,1200)
    shadow_depth=raster(meshes,light_project,1200,1200,False)[0]
    if view!='under':
        meshes.append(dict(p=np.array([[-50,-0.0003,-50],[50,-0.0003,-50],[50,-0.0003,50],[-50,-0.0003,50]]),n=np.tile([0,1,0],(4,1)),uv=np.zeros((4,2)),t=np.zeros((4,4)),idx=np.array([[0,2,1],[0,3,2]]),m=len(gltf['materials'])))
    _,ns,ps,uvs,ts,ids=raster(meshes,project,w,h)
    valid=ids>=0;P=ps[valid];N=normalize(ns[valid]);UV=uvs[valid];T=ts[valid];ID=ids[valid]
    colors=np.ones((len(P),3));rough=np.full(len(P),0.8);metal=np.zeros(len(P))
    for i,material in enumerate(gltf['materials']):
        mask=ID==i
        if not np.any(mask):continue
        runtime=state['materials'][material['name']]
        colors[mask]=runtime['color'];rough[mask]=runtime['roughness'];metal[mask]=runtime['metalness']
        uv=UV[mask]*runtime['repeat']+runtime['offset'];pbr=material['pbrMetallicRoughness']
        finish=STATE_DATA.get('finishCatalog',{}).get(runtime.get('finishId'))
        if finish and finish['kind']=='texture':
            colors[mask]*=linear(sample_finish(finish,'color',uv))
            rough[mask]*=sample_finish(finish,'roughness',uv)[:,0]
            detail=sample_finish(finish,'normal',uv)*2-1
            detail[:,:2]*=np.array(runtime.get('normalScale',[1,1]))
            tangent=normalize(T[mask,:3]);bitangent=np.cross(N[mask],tangent)*T[mask,3,None]
            N[mask]=normalize(tangent*detail[:,0,None]+bitangent*detail[:,1,None]+N[mask]*detail[:,2,None])
        elif not finish:
            if 'baseColorTexture' in pbr:colors[mask]*=linear(sample(pbr['baseColorTexture']['index'],uv))
            if 'metallicRoughnessTexture' in pbr:rough[mask]*=sample(pbr['metallicRoughnessTexture']['index'],uv)[:,1]
            if 'normalTexture' in material:
                detail=sample(material['normalTexture']['index'],uv)*2-1;detail[:,:2]*=material['normalTexture'].get('scale',1)
                tangent=normalize(T[mask,:3]);bitangent=np.cross(N[mask],tangent)*T[mask,3,None]
                N[mask]=normalize(tangent*detail[:,0,None]+bitangent*detail[:,1,None]+N[mask]*detail[:,2,None])
    colors[ID==len(gltf['materials'])]=linear(np.array([228,225,219])/255)
    V=normalize(eye-P);rough=np.maximum(rough,0.09)
    light_coords=light_project(P+N*.002)
    lx=light_coords[:,0]-.5;ly=light_coords[:,1]-.5
    xi=np.floor(lx).astype(int);yi=np.floor(ly).astype(int)
    fx=lx-xi;fy=ly-yi
    def z_at(x,y):
        return np.where(np.isfinite(shadow_depth[np.clip(y,0,1199),np.clip(x,0,1199)]),shadow_depth[np.clip(y,0,1199),np.clip(x,0,1199)],1e6)
    z00=z_at(xi,yi);z10=z_at(xi+1,yi);z01=z_at(xi,yi+1);z11=z_at(xi+1,yi+1)
    shadow_z=(z00*(1-fx)+z10*fx)*(1-fy)+(z01*(1-fx)+z11*fx)*fy
    in_light=(lx>=0)&(lx<1198)&(ly>=0)&(ly<1198)
    shade=((light_coords[:,2]>shadow_z+.0015)&in_light).astype(float)
    shadow=np.zeros((h,w));shadow[valid]=shade;shadow=gaussian_filter(shadow,2.4)
    shade=shadow[valid]
    out=colors*(0.31+0.27*np.maximum(N[:,1,None],0))
    out+=0.025*(1-rough[:,None])*(0.3+0.7*np.abs(N[:,0,None]))
    for li,(direction,power) in enumerate([([-3.5,5,4],3.4),([4,3,2],.9),([0,4,-3],1.1)]):
        L=normalize(np.array(direction,dtype=float));H=normalize(V+L)
        nl=np.clip(N@L,0,1);nv=np.clip(np.sum(N*V,-1),0.001,1);nh=np.clip(np.sum(N*H,-1),0,1);vh=np.clip(np.sum(V*H,-1),0,1)
        a=rough**2;a2=a*a;D=a2/(np.pi*(nh*nh*(a2-1)+1)**2+1e-7)
        k=(rough+1)**2/8;G=(nl/(nl*(1-k)+k+1e-8))*(nv/(nv*(1-k)+k))
        F0=0.04*(1-metal[:,None])+colors*metal[:,None];F=F0+(1-F0)*(1-vh[:,None])**5
        specular=D[:,None]*G[:,None]*F/(4*nl[:,None]*nv[:,None]+1e-6)
        diffuse=colors*(1-metal[:,None])/np.pi
        visibility=(1-0.78*shade) if li==0 else np.ones(len(P))
        out+=(diffuse+specular)*nl[:,None]*power*visibility[:,None]
    rgb=np.full((h,w,3),[0.925,0.914,0.892],dtype=float)
    rgb[valid]=np.clip(srgb(aces(out)),0,1)
    return Image.fromarray((rgb*255).astype('uint8'))

def font(size):
    return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',size)

def decorate(image,state,label):
    w,h=image.size
    canvas=Image.new('RGB',(w,h+148),(244,242,237));canvas.paste(image,(0,88));draw=ImageDraw.Draw(canvas)
    draw.text((32,18),f"{SPEC['number']:02d}  /  {SPEC['label']}",font=font(25),fill=(40,40,36))
    d=state['dimensions']
    dims=' × '.join(str(round(d[k]*1000)) for k in ['width','height','depth'])
    draw.text((32,52),label,font=font(17),fill=(99,99,91))
    draw.text((32,h+105),f"Ш × В × Г  {dims} мм   ·   плита 16 мм",font=font(18),fill=(66,66,62))
    return canvas

def main():
    (SOURCE/'previews').mkdir(exist_ok=True)
    states={s['name']:s for s in STATE_DATA['states']}
    labels={'base':'Исходный размер','min':'Минимальный размер','intermediate':'Промежуточный размер','max':'Максимальный размер','return-base':'Возврат к исходному размеру','open-base':'Технический вид: открытые фасады и ящики','open-max':'Технический вид при максимальных размерах','interior-base':'Технический вид: фасады сняты','materials-base':'Корпус — дуб; фасады — серый дуб'}
    selected=sys.argv[1:] or list(labels)
    for name in selected:
        state=states[name]
        view='front' if name=='interior-base' else 'main'
        # Supersampling improves the sub-pixel 0.7 mm bevels in the exported sheet.
        rendered=render(state,view=view,w=1650,h=1350).resize((1100,900),Image.Resampling.LANCZOS)
        image=decorate(rendered,state,labels[name])
        image.save(SOURCE/'previews'/f'{name}.png')
        print(SPEC['id'],name,flush=True)

if __name__=='__main__':main()
