// Проверка v1 + v2 + v3. Сам проверяющий скрипт не входит в manifest.
// Скрипт только читает файлы и состояние Git. Зависимости не нужны.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const manifest = {
  "files": [
    {
      "path": "public/materials/stone/terrazzo-neutral/base-color.jpg",
      "sha256": "93f86f21687681bf50e3bb1f86b62eb21f4921ac25347e89620dba09ad37c712",
      "textSha256": null
    },
    {
      "path": "public/materials/stone/terrazzo-neutral/roughness.jpg",
      "sha256": "52c227a5b419296a39039641b2e879d3188f512b7ff2c1ce85211dbaf400aaf8",
      "textSha256": null
    },
    {
      "path": "public/materials/stone/terrazzo-neutral/normal-gl.jpg",
      "sha256": "c0d34140bfff7f77ba2ecbc99f1e161b5cb0650e4b4b2c180e703b14909b1ca9",
      "textSha256": null
    },
    {
      "path": "public/materials/wood/oak-silver/base-color.jpg",
      "sha256": "1e47d6fa57a92889fa4a8ba4af091234b815bf3567568174571b7fc283e2349f",
      "textSha256": null
    },
    {
      "path": "public/materials/wood/oak-silver/roughness.jpg",
      "sha256": "17e92533bce1cb47ced318773c53c8333967bd1f0342552759cf9de819e92c7e",
      "textSha256": null
    },
    {
      "path": "public/materials/wood/oak-silver/normal-gl.jpg",
      "sha256": "aa6ff34f725c15ce416200b5a0ed104dd8a86477ad70163d85f3439aec416808",
      "textSha256": null
    },
    {
      "path": "public/materials/wood/oak-black/base-color.jpg",
      "sha256": "312aae3c5133521da39c5680459a4dffd175a8dab0daedf907114cebf81495e0",
      "textSha256": null
    },
    {
      "path": "public/materials/wood/oak-black/roughness.jpg",
      "sha256": "0c45d3c40df7448bb52fda8c47ede5e1a0db2edd0c85edd59fa16a6e058a7708",
      "textSha256": null
    },
    {
      "path": "public/materials/wood/oak-black/normal-gl.jpg",
      "sha256": "aa6ff34f725c15ce416200b5a0ed104dd8a86477ad70163d85f3439aec416808",
      "textSha256": null
    },
    {
      "path": "public/materials/wood/oak-grey/base-color.jpg",
      "sha256": "7aaa81ef7fc776c0db794085af5c093f52aa68d458f69d64c8af2f5b9129bb6e",
      "textSha256": null
    },
    {
      "path": "public/materials/wood/oak-grey/roughness.jpg",
      "sha256": "b5d2b0bab72b3b8050fc1361ffeef7e6be725bcec645c29d652d4fc23141c0f4",
      "textSha256": null
    },
    {
      "path": "public/materials/wood/oak-grey/normal-gl.jpg",
      "sha256": "aa6ff34f725c15ce416200b5a0ed104dd8a86477ad70163d85f3439aec416808",
      "textSha256": null
    },
    {
      "path": "src/three/models/u-frame-table/config.ts",
      "sha256": "9ade92dcdd2bc432fd835c888c35ba24d4d84036eca642f49401fb49bdd47c17",
      "textSha256": "9ade92dcdd2bc432fd835c888c35ba24d4d84036eca642f49401fb49bdd47c17"
    },
    {
      "path": "src/three/models/slat-pedestal-table/config.ts",
      "sha256": "f73c4ffafe2f0204dc67890ce99d93f545c058418a4ca6f11b1f433df631f72d",
      "textSha256": "79ed9b26a898cd4138695d415fc67c52e060c060e95c18f152c0e2c96a3e6cb5"
    },
    {
      "path": "src/three/models/first-table/config.ts",
      "sha256": "2c356af9773315f65b9aa15809666e6816c9cd67b04d3fdd3bb2f76fdc0e055b",
      "textSha256": "63421ef771400ef6fc0f413e0ad73571a80b5ba31e6be309bf16ec0936986b17"
    },
    {
      "path": "src/three/materials/materialSystem.integration.test.ts",
      "sha256": "7a81e452a80419dd86a2ba9339b25d51a28f5561f7b3427986830293ee8e43ef",
      "textSha256": "290a4fecb9f2ef254d1df62371811f2b9c4e66b1deec50b321688387f1450d95"
    },
    {
      "path": "src/three/materials/materialRegistry.ts",
      "sha256": "70efcc6a07cb5fd800d5c66100ae907306c0cc2b5a487ff84f5f76165b9040ba",
      "textSha256": "59c3e4b32c0833fd026f73158a8290831c5423f3d0f403d27e95b93145eaf4ce"
    },
    {
      "path": "public/models/table-04-v-pedestal.glb",
      "sha256": "cf6192eeacf91a9bf9ba4afd0c653ea0d35d37d4a2b48e35dafa1bfaf47be210",
      "textSha256": null
    },
    {
      "path": "public/materials/stone/marble-duo-gold/base-color.jpg",
      "sha256": "b1b82180a3f24d060e2d72abbacb604c41e6b5b3d1736d4dedacf2464fdbe40c",
      "textSha256": null
    },
    {
      "path": "public/materials/stone/marble-duo-gold/roughness.jpg",
      "sha256": "b251630bfed4565c75cda9ac2c4f45b81d11d8d26fb06ff13b645d3d04f45338",
      "textSha256": null
    },
    {
      "path": "public/materials/stone/marble-duo-gold/normal-gl.jpg",
      "sha256": "622893a75895b2264ad4c4f06eb7c237a07b014f1e46f9b7ae91c38f0385525a",
      "textSha256": null
    },
    {
      "path": "public/materials/stone/marble-white-gold/base-color.jpg",
      "sha256": "22a3e353f66c647e6e0c2a13cb59e37b4d8f34e352cf97b0cce207a706f5ce58",
      "textSha256": null
    },
    {
      "path": "public/materials/stone/marble-white-gold/roughness.jpg",
      "sha256": "220e23d198b59f0cd46fc4939328abebaa013d65179e7dc2b4c9e2ea6cfdd7ba",
      "textSha256": null
    },
    {
      "path": "public/materials/stone/marble-white-gold/normal-gl.jpg",
      "sha256": "73fb6990ab2ffc3299b0f12619ba72ff0933f5a39681a0c0e1029c082bd6dd84",
      "textSha256": null
    },
    {
      "path": "public/materials/stone/marble-black-gold/base-color.jpg",
      "sha256": "8b42c56b3e10ea704cf19984904ec0f75fb96ef361e93cb515272ea55b9c0de4",
      "textSha256": null
    },
    {
      "path": "public/materials/stone/marble-black-gold/roughness.jpg",
      "sha256": "dd99e0ef6a7d85ab9da313721dd30062cbf87a487422c0758258fcb38c424ad4",
      "textSha256": null
    },
    {
      "path": "public/materials/stone/marble-black-gold/normal-gl.jpg",
      "sha256": "a1e50ac7ecfe6ccffb013a81f16a6eb48650a7b4f20fa9f2ad5718cc9508f106",
      "textSha256": null
    },
    {
      "path": "assets/source/table-04-v-pedestal/build_table_04_v_pedestal.mjs",
      "sha256": "bb09cc47ee88cc8a12cf729e1f67909b9ac1c526718b50f00d554c798eda08cc",
      "textSha256": "bb45482737053646a1fe643003b337af96718d7a02098d81a7482cf63159d91b"
    },
    {
      "path": "assets/source/table-04-v-pedestal/validation-report.md",
      "sha256": "aaab2a4884a0b5328ed3c0820cae3fa2dd2b06e57e274ae05bf59ebd3ad625f7",
      "textSha256": "708e2005ef225b830665c46cd5fd79f91c19ae981ab1c82a5d0efc26a8e69b08"
    },
    {
      "path": "assets/source/table-04-v-pedestal/create_table_04_v_pedestal.py",
      "sha256": "e7a3f53ff962af123c8bc23920abbf63ea58a250a2714bfd69b8047656fac184",
      "textSha256": "2401e59ad0ed7436cf224efab7572984bd741504c64ca9f0c3571b27b02bd385"
    },
    {
      "path": "assets/source/table-04-v-pedestal/README.md",
      "sha256": "3261033ea98da4bd9affacbddbd7b69572295795530bc23fe98989429e2179a7",
      "textSha256": "6e0361b67a31ae28db0f3d0b394e73bf6eb9931a176d7de17c42a7a75de6b6cf"
    },
    {
      "path": "assets/source/table-04-v-pedestal/model-passport.md",
      "sha256": "4c458126edbaa56f001be745b8389a91b72d019add24fb29cda52eec3ba4e053",
      "textSha256": "59709680838f5fdb00572aa639a7c8bca5c36538f56c300f46bfcc09d6e14feb"
    },
    {
      "path": "assets/source/table-04-v-pedestal/gltf-validator-report.json",
      "sha256": "52933b50259e49bc37f9a56c1f4ca55425382d368bbc582ad26ec4c207b8c28c",
      "textSha256": "52933b50259e49bc37f9a56c1f4ca55425382d368bbc582ad26ec4c207b8c28c"
    },
    {
      "path": "assets/materials/source/previews/custom-finishes-contact-sheet.jpg",
      "sha256": "82f6aca4e6e484854ce4de92cdc75d672c40a4031da799d6412f8311b95f2dc6",
      "textSha256": null
    },
    {
      "path": "assets/materials/source/generate_custom_finishes.py",
      "sha256": "0c230f8b82f7d29ea503d76d3de7032ed9d63240b671d7e72cbb0184bcbdaf09",
      "textSha256": "0c230f8b82f7d29ea503d76d3de7032ed9d63240b671d7e72cbb0184bcbdaf09"
    },
    {
      "path": "assets/materials/source/README.md",
      "sha256": "5d3e39ebf90cf455d5ef181ae2d3a19e500f6bdbb33029d2e44e07dd434e94d8",
      "textSha256": "1831133f67ade895b2757db9d5021da6d28595cb191f3a1e87a0db84af446334"
    },
    {
      "path": "src/three/models/v-pedestal-table/vPedestalTable.test.ts",
      "sha256": "aad2063a493c4350f4c116f0bcd1af51c98c7cd66398f231337426318663a756",
      "textSha256": "fc5d72747b04a38ab00291ef036ada181915333d2e775ef295f1ae8ab038d782"
    },
    {
      "path": "src/three/models/v-pedestal-table/config.ts",
      "sha256": "8c0343c4ac1910ec6fae066b38464496e4e36e8339fe43c09437e13b679cb72e",
      "textSha256": "2bc3d2a3ecb55e384a7fec2aebe30f7c49e566e495556521b90c748662f2ac21"
    },
    {
      "path": "public/models/table-03-slat-pedestal.glb",
      "sha256": "5ffe90555fe64c161eb1eb7de48738233d19149a898468f192f1a2b16150ccd8",
      "textSha256": null
    },
    {
      "path": "public/models/table-02-u-frame.glb",
      "sha256": "3dd420ddbeeae5ee8a91ceb19bf1599998448772753dabdd1721f893c4205293",
      "textSha256": null
    },
    {
      "path": "docs/updates/material-uv-fixes-v3.md",
      "sha256": "7e13e4d8d2d59725d912bb82ea9378df053a21fff799b888eecfed4e4cdc182d",
      "textSha256": "7e13e4d8d2d59725d912bb82ea9378df053a21fff799b888eecfed4e4cdc182d"
    },
    {
      "path": "assets/source/table-03-slat-pedestal/README.md",
      "sha256": "12a65825e10b6985a07b8fe152efc1d6aedfe9f3fe3085fa7e62485947de9f4e",
      "textSha256": "12a65825e10b6985a07b8fe152efc1d6aedfe9f3fe3085fa7e62485947de9f4e"
    },
    {
      "path": "assets/source/table-03-slat-pedestal/gltf-validator-report.json",
      "sha256": "e7551544ea2df26c97da22f43d688c1270d4dac923c38b3124fe6cfe813d4770",
      "textSha256": "e7551544ea2df26c97da22f43d688c1270d4dac923c38b3124fe6cfe813d4770"
    },
    {
      "path": "assets/source/table-03-slat-pedestal/create_table_03_slat_pedestal.py",
      "sha256": "1d78ccd7f803a191004acdb287a01b2702368252d2fa46a341486c0055936f25",
      "textSha256": "1d78ccd7f803a191004acdb287a01b2702368252d2fa46a341486c0055936f25"
    },
    {
      "path": "assets/source/table-03-slat-pedestal/model-passport.md",
      "sha256": "af57c419c9646d5744eaebe6d44b5e02e52796f2db04ff0a3066af69e62507a9",
      "textSha256": "af57c419c9646d5744eaebe6d44b5e02e52796f2db04ff0a3066af69e62507a9"
    },
    {
      "path": "assets/source/table-03-slat-pedestal/build_table_03_slat_pedestal.mjs",
      "sha256": "98015df2ebd82c395ad380e013008556a7e648625f01b432030b4363873a326c",
      "textSha256": "98015df2ebd82c395ad380e013008556a7e648625f01b432030b4363873a326c"
    },
    {
      "path": "assets/source/table-03-slat-pedestal/validation-report.md",
      "sha256": "00f77c3c36b1615eeeb6fcb56222782d4bc08d17e18f4cd6de03d87613c64f6e",
      "textSha256": "00f77c3c36b1615eeeb6fcb56222782d4bc08d17e18f4cd6de03d87613c64f6e"
    },
    {
      "path": "assets/source/table-02-u-frame/create_table_02_u_frame.py",
      "sha256": "33329e12c7e065c5a8ce95136b636035fdeb5148a4ed9fef12fecb0dd5b10f9f",
      "textSha256": "33329e12c7e065c5a8ce95136b636035fdeb5148a4ed9fef12fecb0dd5b10f9f"
    },
    {
      "path": "assets/source/table-02-u-frame/README.md",
      "sha256": "f47ea3e71452f6066ebb78f6014db872b30b8460b969c28130c965e6ebb8a201",
      "textSha256": "f47ea3e71452f6066ebb78f6014db872b30b8460b969c28130c965e6ebb8a201"
    },
    {
      "path": "assets/source/table-02-u-frame/gltf-validator-report.json",
      "sha256": "62ac1d9ae985bb870b53f1b614d840ea49a341a037d71aa502ebbcab1ed2f725",
      "textSha256": "62ac1d9ae985bb870b53f1b614d840ea49a341a037d71aa502ebbcab1ed2f725"
    },
    {
      "path": "assets/source/table-02-u-frame/update_table_02_uv.mjs",
      "sha256": "3f380739d0c989f872f67320fa581f0be9255cb3d1c669b01378a0445afc451d",
      "textSha256": "3f380739d0c989f872f67320fa581f0be9255cb3d1c669b01378a0445afc451d"
    },
    {
      "path": "assets/source/table-02-u-frame/model-passport.md",
      "sha256": "a03b41fad62237473510b97575e2ae3f785e417107371fb696cc2e222767c0e0",
      "textSha256": "a03b41fad62237473510b97575e2ae3f785e417107371fb696cc2e222767c0e0"
    },
    {
      "path": "assets/source/table-02-u-frame/validation-report.md",
      "sha256": "cb87ce3c779db15734b116a35e45268a7d2e160c15e0794e68c04d133e204b3e",
      "textSha256": "cb87ce3c779db15734b116a35e45268a7d2e160c15e0794e68c04d133e204b3e"
    },
    {
      "path": "src/three/models/tabletopUv.integration.test.ts",
      "sha256": "6b270814e5a43c27d9de2bc820bc46f92d58a9c1056f87db897f6702a7298fd2",
      "textSha256": "6b270814e5a43c27d9de2bc820bc46f92d58a9c1056f87db897f6702a7298fd2"
    }
  ]
};
const projectRoot = path.resolve(process.argv[2] || process.cwd());
const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

function inspect(entry) {
  const file = path.join(projectRoot, ...entry.path.split('/'));
  let bytes;
  try {
    bytes = fs.readFileSync(file);
  } catch (error) {
    return { path: entry.path, status: error.code === 'ENOENT' ? 'MISSING' : 'READ_ERROR' };
  }
  const exact = hash(bytes) === entry.sha256;
  const normalized = entry.textSha256 && hash(
    Buffer.from(bytes.toString('utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n'), 'utf8')
  ) === entry.textSha256;
  return { path: entry.path, status: exact || normalized ? 'MATCH' : 'DIFFERS' };
}

function section(label, results) {
  console.log(`\n${label}: ${results.filter(r => r.status === 'MATCH').length}/${results.length} MATCH`);
  for (const result of results) {
    if (result.status !== 'MATCH') console.log(`${result.status}  ${result.path}`);
  }
}

function git(args) {
  const result = spawnSync('git', ['-C', projectRoot, ...args], { encoding: 'utf8', windowsHide: true });
  if (result.status !== 0) {
    console.log('Git information unavailable.');
    return;
  }
  console.log(result.stdout.trim() || '(empty)');
}

if (!fs.existsSync(path.join(projectRoot, 'package.json')) || !fs.existsSync(path.join(projectRoot, 'src'))) {
  console.error('Project folder not found. Run from furniture-3d-configurator or pass its path as the first argument.');
  process.exitCode = 2;
} else {
  console.log('Furniture 3D Configurator: read-only UV v3 check');
  const results = manifest.files.map(inspect);
  section('V1 + V2 + V3 files', results);
  const count = results.filter(r => r.status === 'MATCH').length;
  console.log(`\nTOTAL: ${count}/${results.length} MATCH`);
  console.log(results.every(r => r.status === 'MATCH')
    ? 'RESULT: V1_V2_V3_FILES_CONFIRMED'
    : 'RESULT: FILES_DIFFER_REVIEW_REQUIRED');
  console.log('This is a content check; browser acceptance and tests are separate.');
  console.log('\nGIT STATUS');
  git(['status', '--short', '--branch']);
  console.log('\nLAST 8 COMMITS');
  git(['log', '-8', '--oneline', '--decorate']);
}
