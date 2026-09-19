#!/usr/bin/env node
// Read-only content check for the modular tables v1 delivery.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const feature = {
  "README.md": "02ac4ed162d6759c4d492090d8b8a43076bdd9ddb370edc21cfa40fc1c57e776",
  "assets/source/table-modules/README.md": "0117a5c7edbf34a05a5ce8482bcc10b33850853294ecc51a4b76e16e1d51b899",
  "assets/source/table-modules/extract_bases.py": "c4dfcd2e1d26c54d4a866fac9a0a40d2090142ce37d40c172b3837b90fbd36a9",
  "assets/source/table-modules/previews/round-fluted-tall.png": "047a5dff48ebbfa1cbfcd79460c0ac6f0c968154c3b3981ecab8f6cb75f1b71f",
  "assets/source/table-modules/previews/rounded-slat.png": "a31a7d276c2815f92d18163c8091f1eee43e2382779c8a6a2db1dc86ff8363ec",
  "assets/source/table-modules/round-fluted-gltf-report.json": "2b0ed67dfbf9e9af8c5e88c2d44bfce60c10d99566aee593eec181fbc21ca413",
  "assets/source/table-modules/slat-pedestal-gltf-report.json": "425d5bec7d3c387cb0aeb025e47a899ad753d840d0e3d3d855cb8098e9aa4573",
  "assets/source/table-modules/validation-report.md": "7dae881e3ab6828fc33e3f5bb9b6d3a6a09a29291448cbccc48305c274361682",
  "docs/3d-furniture-asset-standard.md": "40cc979b801c2efead0b94859437769d82522e416e01568bb9173c233056e700",
  "docs/configuration-state.md": "590e00cff29e13c5be05b6d9f63e8b06d37e5c4ff102c4390250f24deb5eef91",
  "docs/table-module-standard-v1.md": "7b95b95784ddbea40cae1acbdc79e98497e840532ea4f8eeb734b190cbfbe878",
  "public/modules/bases/round-fluted.glb": "1c0df9c7970257320f6276992b7a66669812596d9544ea958a3475b814349063",
  "public/modules/bases/slat-pedestal.glb": "c90f91065b914386525f2361c62d847381008e93f14af0ee82a8125d0b94e6e4",
  "src/App.css": "3763a81ce7b207548cfedd12121e995dc60d646cc2d4dfdafb82911cf3d7e3d1",
  "src/App.tsx": "d5125cff75866e4141245cbf944ccafb19fcd1aab19221628cdc84b878b47299",
  "src/components/ConfigurationActions.tsx": "640984372b7500046200e266f492a5e326cf28e42186b0ff6cdfaac997324db5",
  "src/components/TableAssemblyControls.tsx": "b032d6daa88027af10d7b3dd8cf052d648b49ddc6e5a34215d355ae6136cd4b9",
  "src/configurator/configuratorStore.ts": "c42660db5f1038c6d93c965ff4f70675083bcbce5aa447225590cfcc48cf11aa",
  "src/configurator/savedConfiguration.test.ts": "338aac744cdbd75d5d1dac9ddbd0a7b46885708c343deb8a8154efd758178ad8",
  "src/configurator/savedConfiguration.ts": "44d1e7db81279d8718ec95f4bebf4b6f4944a1692bbb7b0fda8795aa4bded63a",
  "src/configurator/tableAssembly/catalog.ts": "f3e685c7b47f9d1702c8671c931e5c4821a0d07764db9691cc34abdecec36d63",
  "src/configurator/tableAssembly/state.test.ts": "c415dacf2a18ae472dc21a9bb1b256997aedcf05812a35c7bb8dc90714086659",
  "src/configurator/tableAssembly/state.ts": "69cd7a6b289adc07dfb8445227309f6f4f36373ce22b3fb39155beb42363b380",
  "src/three/tableAssembly/tableAssembly.integration.test.ts": "661b1f8db1ca10d71d7227f6bc2ce454b380005665de788d6b5192df17c5059d",
  "src/three/tableAssembly/tableAssembly.ts": "423176db39fa211b9e08b96324b15adc6681139ea9b91a81a0d2f12411056133",
  "src/three/tableAssembly/tabletopGeometry.test.ts": "bfd8f1e7ce85bdb2556af92e3179ab6efcf050aad466f8af49ca5409afe438ce",
  "src/three/tableAssembly/tabletopGeometry.ts": "3daff31abc315d176458f7ba46e3e0632cf2d38e2abf7014848c5746360fb4d1",
  "src/three/tableAssembly/useTableAssemblyScene.ts": "62bdbc26a62f486e9c89ed3cd138ca4aff35deee22d9fa0e547264274271b877"
};

const baseline = {
  ".gitignore": "76b9aa4b4d54eb64cadc91fd4371f585ef27d335e872274b2c13e57e81c93d8a",
  "index.html": "9cb24878f664f70d1bd22d67f753b5e29926dc070b5b1f4d12c45d4f22b3fa20",
  "package-lock.json": "7f78d546469fed1a1069f3edef21d4fea53d641467f352d53d29122cab37c0ce",
  "package.json": "044ad2f29d2200d5054b77015a4d47db9238d47a521d01f86d7b67d98115b960",
  "public/favicon.svg": "61bc9a161de58248288e6905425d7180f0624c2865007b97d763fdac12043a66",
  "public/icons.svg": "b45fa506195cfcdef406ba9f0c77b36ddc1a7c224040926ec70abc2fdea7b93a",
  "public/materials/stone/concrete-light/base-color.jpg": "4bc03d76fcc2a706ebb040e6bbc124a2b4b2dfe8c83c3fa14faaddaa0d24f12e",
  "public/materials/stone/concrete-light/normal-gl.jpg": "829095e5e7b78ea711bd05ef616a6096347bc22bbe662c0772944f7809154f18",
  "public/materials/stone/concrete-light/roughness.jpg": "98f2bb223d77c9f73e8a8bb45e3f0978fda2edb0c68bb5105ee3803704956d9a",
  "public/materials/stone/marble-black-gold/base-color.jpg": "8b42c56b3e10ea704cf19984904ec0f75fb96ef361e93cb515272ea55b9c0de4",
  "public/materials/stone/marble-black-gold/normal-gl.jpg": "a1e50ac7ecfe6ccffb013a81f16a6eb48650a7b4f20fa9f2ad5718cc9508f106",
  "public/materials/stone/marble-black-gold/roughness.jpg": "dd99e0ef6a7d85ab9da313721dd30062cbf87a487422c0758258fcb38c424ad4",
  "public/materials/stone/marble-cream/base-color.jpg": "d403786171716f86718bdd67eba923d4fb6125c0636bacef0e6a21dd5d623a48",
  "public/materials/stone/marble-cream/normal-gl.jpg": "d5e17ccb2913adbf28fcb781fddf0aa711259ddea6c1c918442f9a3589aa4660",
  "public/materials/stone/marble-cream/roughness.jpg": "1b970e033856c93ee7390d947da5340e101b489fc8c1463354ea9e6655ce039a",
  "public/materials/stone/marble-duo-gold/base-color.jpg": "b1b82180a3f24d060e2d72abbacb604c41e6b5b3d1736d4dedacf2464fdbe40c",
  "public/materials/stone/marble-duo-gold/normal-gl.jpg": "622893a75895b2264ad4c4f06eb7c237a07b014f1e46f9b7ae91c38f0385525a",
  "public/materials/stone/marble-duo-gold/roughness.jpg": "b251630bfed4565c75cda9ac2c4f45b81d11d8d26fb06ff13b645d3d04f45338",
  "public/materials/stone/marble-white-gold/base-color.jpg": "22a3e353f66c647e6e0c2a13cb59e37b4d8f34e352cf97b0cce207a706f5ce58",
  "public/materials/stone/marble-white-gold/normal-gl.jpg": "73fb6990ab2ffc3299b0f12619ba72ff0933f5a39681a0c0e1029c082bd6dd84",
  "public/materials/stone/marble-white-gold/roughness.jpg": "220e23d198b59f0cd46fc4939328abebaa013d65179e7dc2b4c9e2ea6cfdd7ba",
  "public/materials/stone/terrazzo-neutral/base-color.jpg": "93f86f21687681bf50e3bb1f86b62eb21f4921ac25347e89620dba09ad37c712",
  "public/materials/stone/terrazzo-neutral/normal-gl.jpg": "c0d34140bfff7f77ba2ecbc99f1e161b5cb0650e4b4b2c180e703b14909b1ca9",
  "public/materials/stone/terrazzo-neutral/roughness.jpg": "52c227a5b419296a39039641b2e879d3188f512b7ff2c1ce85211dbaf400aaf8",
  "public/materials/wood/ash-natural/base-color.jpg": "00abb70f86bdfe49aa6e09f350af9e8e1605ccf13171f9be46ceb6018846c06b",
  "public/materials/wood/ash-natural/normal-gl.jpg": "64bbd775ba2978aa12108ecd58419c333eb0c194b52cbc8e1d2bea02252020af",
  "public/materials/wood/ash-natural/roughness.jpg": "3e6b077f6af6ba7725668b438bfc523f1342d0fb4bd497f1c9668663ad189ef0",
  "public/materials/wood/oak-black/base-color.jpg": "312aae3c5133521da39c5680459a4dffd175a8dab0daedf907114cebf81495e0",
  "public/materials/wood/oak-black/normal-gl.jpg": "aa6ff34f725c15ce416200b5a0ed104dd8a86477ad70163d85f3439aec416808",
  "public/materials/wood/oak-black/roughness.jpg": "0c45d3c40df7448bb52fda8c47ede5e1a0db2edd0c85edd59fa16a6e058a7708",
  "public/materials/wood/oak-grey/base-color.jpg": "7aaa81ef7fc776c0db794085af5c093f52aa68d458f69d64c8af2f5b9129bb6e",
  "public/materials/wood/oak-grey/normal-gl.jpg": "aa6ff34f725c15ce416200b5a0ed104dd8a86477ad70163d85f3439aec416808",
  "public/materials/wood/oak-grey/roughness.jpg": "b5d2b0bab72b3b8050fc1361ffeef7e6be725bcec645c29d652d4fc23141c0f4",
  "public/materials/wood/oak-natural/base-color.jpg": "0718c2e1a209afe6138ccb41d70e1a18cd825d1e73db33ad7cf80806fa9ce5a4",
  "public/materials/wood/oak-natural/normal-gl.jpg": "e74a9d3ddcd86473a21815a28464f4dac4ceb8f86e7f170226dede8ed70d8eb9",
  "public/materials/wood/oak-natural/roughness.jpg": "5c81718ee172299c44e0754fadbe652758b6feed05a8fd88be6efff5aa70ca1e",
  "public/materials/wood/oak-silver/base-color.jpg": "1e47d6fa57a92889fa4a8ba4af091234b815bf3567568174571b7fc283e2349f",
  "public/materials/wood/oak-silver/normal-gl.jpg": "aa6ff34f725c15ce416200b5a0ed104dd8a86477ad70163d85f3439aec416808",
  "public/materials/wood/oak-silver/roughness.jpg": "17e92533bce1cb47ced318773c53c8333967bd1f0342552759cf9de819e92c7e",
  "public/materials/wood/pine-coated/base-color.jpg": "7a74bd4b58da02aab73a53f3b307524a6d79c0c10fd4fa94ccc9f9b04839c59a",
  "public/materials/wood/pine-coated/normal-gl.jpg": "72f2f07712d554fc2df1758cea158a75aa438cf5548bae3d99b30405b150b7b3",
  "public/materials/wood/pine-coated/roughness.jpg": "f59af2c9b15a0c3637a7911bed8a859ca075b37cc26517cf0f4f5ad804cc1606",
  "public/materials/wood/walnut-natural/base-color.jpg": "4a1a84e9537b291ac0cce1e2b8908fb9b5d1057a246ee0b3c25345565ac9686d",
  "public/materials/wood/walnut-natural/normal-gl.jpg": "9b1e316d019b2ae07f5327e2a8203ef34d7c8b86dbf2579273d3b5cf8e5fd441",
  "public/materials/wood/walnut-natural/roughness.jpg": "2056eb8c99a936bdc7ec4fc6b04e3b1a443c7c87ca8fd0e7011bed6188290fef",
  "public/models/first-table.glb": "af63ef033d4af317660158921afebe61d2c040eb052ecaf5c3cd873944941d37",
  "public/models/table-02-u-frame.glb": "3dd420ddbeeae5ee8a91ceb19bf1599998448772753dabdd1721f893c4205293",
  "public/models/table-03-slat-pedestal.glb": "5ffe90555fe64c161eb1eb7de48738233d19149a898468f192f1a2b16150ccd8",
  "public/models/table-04-v-pedestal.glb": "cf6192eeacf91a9bf9ba4afd0c653ea0d35d37d4a2b48e35dafa1bfaf47be210",
  "public/models/table-05-round-fluted-pedestal.glb": "b7dd9a612b372a05eebb4211b2a36061a1a11c164b1b13188b11e715d287830f",
  "public/models/table-06-round-splayed-legs.glb": "d801ae3b427a41a4bb15901ff100e64bfbdaed570c0d9a7342dbcf255227da62",
  "src/assets/hero.png": "881ffbcaafc212e49addad08846a5b82761355fa20624253af3477ba33262c5c",
  "src/assets/react.svg": "35ef61ed53b323ae94a16a8ec659b3d0af3880698791133f23b084085ab1c2e5",
  "src/assets/vite.svg": "5be21acd42eb7b896e517f4e0f0f11eb5c5d9e54fbbcebe9453f033008fcca6f",
  "src/components/ui/CustomSelect/CustomSelect.module.css": "d994a04b8fbd33d479a1466be7026e56969af70a09755e6cff1351d4841c0938",
  "src/components/ui/CustomSelect/CustomSelect.tsx": "4b83dc82c58a4ff4087be763bf8f37a5c311be16eb3e8181ee177092632db053",
  "src/configurator/configuratorState.ts": "c61477af4bdcff809ae0273491320c81c3690678cd0907f04e7834b390bbfc8c",
  "src/configurator/configuratorStore.test.ts": "bb392725fec554fe23438bfa2425ed0ac6b5b806720d2f953b1bd16c3bc3e62a",
  "src/configurator/furnitureRegistry.ts": "ac67be67d492c74fe2173aee6c480d95a9662b13b936e0d7f1e0d9c31c402e96",
  "src/configurator/useConfigurator.ts": "06b7ff68ad3fa92fb9906d29c8588b56cdadec90dd322b309b7f8178858c3018",
  "src/index.css": "0a7c4e4a8795845c350a27280ad25df1f202b8ade9c0cf0150068d31b5a030c2",
  "src/main.tsx": "6e9e5807fcbd48b75a96db5cbef36c996262196be42e6d4760dc86babbe61ad2",
  "src/three/core/createSceneEnvironment.ts": "d410aec176092f118846373d98c4682e129771055ab01ff3498b22ff78dbc4ec",
  "src/three/core/createThreeRuntime.ts": "6f6ba31ca1932958eab68aa258e7fd987dac64b17e55d677fcb25bc67f4e7a4b",
  "src/three/furniture/furnitureController.test.ts": "fcb7f83ac3729e4f26913612b0194ba24ce051f7df9c571934356726fd185e76",
  "src/three/furniture/furnitureController.ts": "13f26f9846710a7fc6f0c897f32100c4f69af5f25d5dec4f4ad60e19bfc32c28",
  "src/three/furniture/model.ts": "67ad584b028d18897a1ac3fb516ef702ee25baaf63a0484c66991d7bef50a9d0",
  "src/three/furniture/types.ts": "d4375ccfbe2397a1fc8084e20675004d3d427ee984259cc2023c69cea11fa3b7",
  "src/three/materials/createMaterial.ts": "7b71139726cd38f7fdbf0f6eded63aebdf8d4e6dccbdfff96c08f4920709d7fb",
  "src/three/materials/disposeMaterials.ts": "1cfc606cef1c11a099c197e371609f439d64f0d07cfe668100652989f1e1a076",
  "src/three/materials/materialController.test.ts": "d8342a2e1f9a6a387d9384af64587e4bc20651879b4a4d455dec7fd6ac1a69e6",
  "src/three/materials/materialController.ts": "dbc1a61cebe4c64dc3d4228f6cd85f63c9204c66b6a1b07de3ca053e1fe6e310",
  "src/three/materials/materialRefresh.integration.test.ts": "b63139d7039f8dcd07c49ae06c8cd68aca80e7aba906c4096b65c2ec6a7a39d7",
  "src/three/materials/materialRegistry.ts": "59c3e4b32c0833fd026f73158a8290831c5423f3d0f403d27e95b93145eaf4ce",
  "src/three/materials/materialSystem.integration.test.ts": "290a4fecb9f2ef254d1df62371811f2b9c4e66b1deec50b321688387f1450d95",
  "src/three/materials/types.ts": "4bbaee1ea8bf490fa812e6444361a4a78231405a0cb9162f082c66e9945a01ac",
  "src/three/models/first-table/config.ts": "63421ef771400ef6fc0f413e0ad73571a80b5ba31e6be309bf16ec0936986b17",
  "src/three/models/round-fluted-pedestal-table/config.ts": "b2278f95dfc4a15bd44e4e6af3fb667589878fc4760b5af6966a9051b70087c0",
  "src/three/models/round-fluted-pedestal-table/roundTable.test.ts": "1a8439397b1d6da40aa90ebe7136ab821c615ce063b84439fe55cbaff212f7e0",
  "src/three/models/round-splayed-legs-table/config.ts": "dc99896f608bc1e4c19804ca41d1dd73e3b65bf9cd9568c9ac9f1d8392e9b3ea",
  "src/three/models/round-splayed-legs-table/roundTable.test.ts": "2591e9151cf0c8e0c38996b66e1edac592fdf015571f5222bff3d4789f890592",
  "src/three/models/slat-pedestal-table/config.ts": "79ed9b26a898cd4138695d415fc67c52e060c060e95c18f152c0e2c96a3e6cb5",
  "src/three/models/slat-pedestal-table/slatPedestalTable.test.ts": "a8bad150d238f39770aa1eb94bad74249b9651c1b8b77b3897121c8716d3561f",
  "src/three/models/tabletopUv.integration.test.ts": "6b270814e5a43c27d9de2bc820bc46f92d58a9c1056f87db897f6702a7298fd2",
  "src/three/models/u-frame-table/config.ts": "9ade92dcdd2bc432fd835c888c35ba24d4d84036eca642f49401fb49bdd47c17",
  "src/three/models/u-frame-table/uFrameTable.test.ts": "41f0935a4338b3d0e7ebe3915ae552809a36cc54e55f3aef458c80e02f93a1d1",
  "src/three/models/v-pedestal-table/config.ts": "2bc3d2a3ecb55e384a7fec2aebe30f7c49e566e495556521b90c748662f2ac21",
  "src/three/models/v-pedestal-table/vPedestalTable.test.ts": "fc5d72747b04a38ab00291ef036ada181915333d2e775ef295f1ae8ab038d782",
  "tsconfig.app.json": "8e5d12ba330e7d86409edec74b95451e0db22ee09b9426c94b5bf817571eddb0",
  "tsconfig.json": "770b4140bbb581e2dfd9ea9946ffc9c75a1d86ba7d2db5f77c83e37cbdf9d808",
  "tsconfig.node.json": "d366cc0827139db39c61815f22491bbfda56c654354a42ad7795143d314e45e8",
  "vite.config.ts": "4d36db3522a7b2dd10e0936e1004373c7ee65f10f7cd7920cd76410459c15a45"
};

const root = path.resolve(__dirname, '..');
const textExtensions = new Set(['.ts', '.tsx', '.js', '.cjs', '.mjs', '.css', '.json', '.md', '.html', '.svg', '.py']);
function check(label, entries) {
  const problems = [];
  let matched = 0;
  for (const [relativePath, expected] of Object.entries(entries)) {
    const file = path.join(root, relativePath);
    if (!fs.existsSync(file)) { problems.push(`MISSING  ${relativePath}`); continue; }
    let bytes = fs.readFileSync(file);
    if (textExtensions.has(path.extname(file)) || path.basename(file) === '.gitignore') {
      bytes = Buffer.from(bytes.toString('utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n'), 'utf8');
    }
    const actual = crypto.createHash('sha256').update(bytes).digest('hex');
    if (actual === expected) matched += 1;
    else problems.push(`DIFFERS  ${relativePath}`);
  }
  console.log(`${label}: ${matched}/${Object.keys(entries).length} MATCH`);
  for (const problem of problems) console.log(problem);
  return problems.length === 0;
}
console.log('Furniture 3D Configurator: read-only modular tables v1 check\n');
const featureOk = check('Modular table feature files', feature);
console.log('');
const baselineOk = check('Compatible baseline runtime files', baseline);
console.log('');
console.log(featureOk && baselineOk ? 'RESULT: MODULAR_TABLES_V1_FILES_CONFIRMED' : 'RESULT: FILES_DIFFER_REVIEW_REQUIRED');
console.log('Local docs/updates notes are optional and excluded.');
console.log('This is a content check; tests, browser acceptance and Git commits are separate.');
process.exitCode = featureOk && baselineOk ? 0 : 1;
