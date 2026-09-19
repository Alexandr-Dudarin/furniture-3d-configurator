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
    v=gltf['bufferViews'][entry['bufferView']]
    image=Image.open(io.BytesIO(blob[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']])).convert('RGB')
    images.append(np.array(image,dtype=np.float32)/255)

def sample(texture_index,uv):
    im=images[gltf['textures'][texture_index]['source']];h,w=im.shape[:2]
    x=(uv[:,0]%1)*w-0.5;y=(uv[:,1]%1)*h-0.5
    xi=np.floor(x).astype(int);yi=np.floor(y).astype(int);fx=(x-xi)[:,None];fy=(y-yi)[:,None]
    return ((im[yi%h,xi%w]*(1-fx)+im[yi%h,(xi+1)%w]*fx)*(1-fy)+(im[(yi+1)%h,xi%w]*(1-fx)+im[(yi+1)%h,(xi+1)%w]*fx)*fy)

def linear(c):return np.where(c<=0.04045,c/12.92,((c+0.055)/1.055)**2.4)
def srgb(c):return np.where(c<=0.0031308,c*12.92,1.055*np.maximum(c,0)**(1/2.4)-0.055)
def aces(x):return np.clip((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0,1)

def render(state,view='main',w=1200,h=900,white=False):
    meshes=geometry(state)
    target=[0,0.38,0]
    span=1.44 if view=='main' else 1.65
    eyes={'main':[1.55,1.18,2.0],'front':[0,0.83,3],'right':[3,0.83,0],'back':[0,0.83,-3],'left':[-3,0.83,0],'under':[1,-0.7,1.25]}
    eye=eyes[view]
    project,eye=camera(eye,target,span,w,h)
    light_project,_=camera([-2.5,4,2.8],[0,0.1,0],3,1000,1000)
    shadow_depth=raster(meshes,light_project,1000,1000,False)[0]
    if view!='under':
        meshes.append(dict(p=np.array([[-6,-0.0003,-6],[6,-0.0003,-6],[6,-0.0003,6],[-6,-0.0003,6]]),n=np.tile([0,1,0],(4,1)),uv=np.zeros((4,2)),t=np.zeros((4,4)),idx=np.array([[0,2,1],[0,3,2]]),m=4))
    _,ns,ps,uvs,ts,ids=raster(meshes,project,w,h)
    valid=ids>=0;P=ps[valid];N=normalize(ns[valid]);UV=uvs[valid];T=ts[valid];ID=ids[valid]
    colors=np.ones((len(P),3));rough=np.full(len(P),0.8);metal=np.zeros(len(P))
    for i,material in enumerate(gltf['materials']):
        mask=ID==i;runtime=state['materials'][material['name']]
        colors[mask]=runtime['color'];rough[mask]=runtime['roughness'];metal[mask]=runtime['metalness']
        if material['name']=='Metal_Frame' and white:colors[mask]=linear(np.array([232,231,226])/255);rough[mask]=0.32
        uv=UV[mask]*runtime['repeat']+runtime['offset'];pbr=material['pbrMetallicRoughness']
        if 'baseColorTexture' in pbr:colors[mask]*=linear(sample(pbr['baseColorTexture']['index'],uv))
        if 'metallicRoughnessTexture' in pbr:rough[mask]*=sample(pbr['metallicRoughnessTexture']['index'],uv)[:,1]
        if 'normalTexture' in material:
            detail=sample(material['normalTexture']['index'],uv)*2-1;detail[:,:2]*=material['normalTexture'].get('scale',1)
            tangent=normalize(T[mask,:3]);bitangent=np.cross(N[mask],tangent)*T[mask,3,None]
            N[mask]=normalize(tangent*detail[:,0,None]+bitangent*detail[:,1,None]+N[mask]*detail[:,2,None])
    colors[ID==4]=linear(np.array([228,225,219])/255)
    V=normalize(eye-P);rough=np.maximum(rough,0.09)
    light_coords=light_project(P);sx=np.clip(light_coords[:,0].astype(int),0,999);sy=np.clip(light_coords[:,1].astype(int),0,999)
    in_light=(light_coords[:,0]>=0)&(light_coords[:,0]<1000)&(light_coords[:,1]>=0)&(light_coords[:,1]<1000)
    shade=((light_coords[:,2]>shadow_depth[sy,sx]+0.0025)&in_light).astype(float)
    shadow=np.zeros((h,w));shadow[valid]=shade;shadow=gaussian_filter(shadow,2.4)
    shade=shadow[valid]
    out=colors*(0.31+0.27*np.maximum(N[:,1,None],0))
    out+=0.025*(1-rough[:,None])*(0.3+0.7*np.abs(N[:,0,None]))
    for li,(direction,power) in enumerate([([-2.5,4,2.8],3.8),([3,1.5,-2],1.45),([0,3,-3],0.8)]):
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
    w,h=image.size;canvas=Image.new('RGB',(w,h+112),(244,242,237));canvas.paste(image,(0,70));draw=ImageDraw.Draw(canvas)
    draw.text((30,17),SPEC['label'],font=font(25),fill=(40,40,36))
    draw.text((30,h+80),f"{label}   ·   Ø {round(state['diameter']*100)} см   ·   H {round(SPEC['height']*100)} см   ·   {round(SPEC['thickness']*1000)} мм",font=font(18),fill=(66,66,62))
    return canvas

def main():
    (SOURCE/'previews').mkdir(exist_ok=True)
    states={s['name']:s for s in STATE_DATA['states']}
    for name,label in [('base','Исходный размер'),('intermediate','Промежуточный размер'),('max','Максимальный размер'),('return-base','Возврат к исходному размеру')]:
        image=decorate(render(states[name]),states[name],label)
        image.save(SOURCE/'previews'/f'{name}.png')
        print(SPEC['id'],name,flush=True)
    sheet=Image.new('RGB',(1500,920),(244,242,237));draw=ImageDraw.Draw(sheet)
    draw.text((24,15),'Основание: четыре стороны и вид снизу',font=font(23),fill=(40,40,36))
    for row,white in enumerate([False,True]):
        for col,view in enumerate(['front','right','back','left','under']):
            frame=render(states['base'],view,w=300,h=400,white=white)
            sheet.paste(frame,(col*300,60+row*430))
            draw.text((col*300+12,465+row*430),view+(' · white' if white else ' · black'),font=font(14),fill=(60,60,55))
    sheet.save(SOURCE/'previews'/'base-connections-black-white.png')
    print(SPEC['id'],'connection sheet',flush=True)

if __name__=='__main__':main()
