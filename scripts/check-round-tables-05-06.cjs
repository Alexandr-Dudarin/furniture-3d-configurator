// Проверка v1 + v2 + v3 + интеграции круглых столов 05/06. Скрипт не входит в manifest.
// Скрипт только читает файлы и состояние Git. Зависимости не нужны.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const manifest = {
  "files": [
    {
      "path": "README.md",
      "sha256": "087f7208aaead50acfcbf5e390b139ae574f0186aa8bc07fc6a7449465be96c1",
      "textSha256": "087f7208aaead50acfcbf5e390b139ae574f0186aa8bc07fc6a7449465be96c1"
    },
    {
      "path": "assets/materials/source/README.md",
      "sha256": "5d3e39ebf90cf455d5ef181ae2d3a19e500f6bdbb33029d2e44e07dd434e94d8",
      "textSha256": "1831133f67ade895b2757db9d5021da6d28595cb191f3a1e87a0db84af446334"
    },
    {
      "path": "assets/materials/source/generate_custom_finishes.py",
      "sha256": "0c230f8b82f7d29ea503d76d3de7032ed9d63240b671d7e72cbb0184bcbdaf09",
      "textSha256": "0c230f8b82f7d29ea503d76d3de7032ed9d63240b671d7e72cbb0184bcbdaf09"
    },
    {
      "path": "assets/materials/source/previews/custom-finishes-contact-sheet.jpg",
      "sha256": "82f6aca4e6e484854ce4de92cdc75d672c40a4031da799d6412f8311b95f2dc6",
      "textSha256": null
    },
    {
      "path": "assets/source/table-02-u-frame/README.md",
      "sha256": "f47ea3e71452f6066ebb78f6014db872b30b8460b969c28130c965e6ebb8a201",
      "textSha256": "f47ea3e71452f6066ebb78f6014db872b30b8460b969c28130c965e6ebb8a201"
    },
    {
      "path": "assets/source/table-02-u-frame/create_table_02_u_frame.py",
      "sha256": "33329e12c7e065c5a8ce95136b636035fdeb5148a4ed9fef12fecb0dd5b10f9f",
      "textSha256": "33329e12c7e065c5a8ce95136b636035fdeb5148a4ed9fef12fecb0dd5b10f9f"
    },
    {
      "path": "assets/source/table-02-u-frame/gltf-validator-report.json",
      "sha256": "62ac1d9ae985bb870b53f1b614d840ea49a341a037d71aa502ebbcab1ed2f725",
      "textSha256": "62ac1d9ae985bb870b53f1b614d840ea49a341a037d71aa502ebbcab1ed2f725"
    },
    {
      "path": "assets/source/table-02-u-frame/model-passport.md",
      "sha256": "a03b41fad62237473510b97575e2ae3f785e417107371fb696cc2e222767c0e0",
      "textSha256": "a03b41fad62237473510b97575e2ae3f785e417107371fb696cc2e222767c0e0"
    },
    {
      "path": "assets/source/table-02-u-frame/update_table_02_uv.mjs",
      "sha256": "3f380739d0c989f872f67320fa581f0be9255cb3d1c669b01378a0445afc451d",
      "textSha256": "3f380739d0c989f872f67320fa581f0be9255cb3d1c669b01378a0445afc451d"
    },
    {
      "path": "assets/source/table-02-u-frame/validation-report.md",
      "sha256": "cb87ce3c779db15734b116a35e45268a7d2e160c15e0794e68c04d133e204b3e",
      "textSha256": "cb87ce3c779db15734b116a35e45268a7d2e160c15e0794e68c04d133e204b3e"
    },
    {
      "path": "assets/source/table-03-slat-pedestal/README.md",
      "sha256": "12a65825e10b6985a07b8fe152efc1d6aedfe9f3fe3085fa7e62485947de9f4e",
      "textSha256": "12a65825e10b6985a07b8fe152efc1d6aedfe9f3fe3085fa7e62485947de9f4e"
    },
    {
      "path": "assets/source/table-03-slat-pedestal/build_table_03_slat_pedestal.mjs",
      "sha256": "98015df2ebd82c395ad380e013008556a7e648625f01b432030b4363873a326c",
      "textSha256": "98015df2ebd82c395ad380e013008556a7e648625f01b432030b4363873a326c"
    },
    {
      "path": "assets/source/table-03-slat-pedestal/create_table_03_slat_pedestal.py",
      "sha256": "1d78ccd7f803a191004acdb287a01b2702368252d2fa46a341486c0055936f25",
      "textSha256": "1d78ccd7f803a191004acdb287a01b2702368252d2fa46a341486c0055936f25"
    },
    {
      "path": "assets/source/table-03-slat-pedestal/gltf-validator-report.json",
      "sha256": "e7551544ea2df26c97da22f43d688c1270d4dac923c38b3124fe6cfe813d4770",
      "textSha256": "e7551544ea2df26c97da22f43d688c1270d4dac923c38b3124fe6cfe813d4770"
    },
    {
      "path": "assets/source/table-03-slat-pedestal/model-passport.md",
      "sha256": "af57c419c9646d5744eaebe6d44b5e02e52796f2db04ff0a3066af69e62507a9",
      "textSha256": "af57c419c9646d5744eaebe6d44b5e02e52796f2db04ff0a3066af69e62507a9"
    },
    {
      "path": "assets/source/table-03-slat-pedestal/validation-report.md",
      "sha256": "00f77c3c36b1615eeeb6fcb56222782d4bc08d17e18f4cd6de03d87613c64f6e",
      "textSha256": "00f77c3c36b1615eeeb6fcb56222782d4bc08d17e18f4cd6de03d87613c64f6e"
    },
    {
      "path": "assets/source/table-04-v-pedestal/README.md",
      "sha256": "3261033ea98da4bd9affacbddbd7b69572295795530bc23fe98989429e2179a7",
      "textSha256": "6e0361b67a31ae28db0f3d0b394e73bf6eb9931a176d7de17c42a7a75de6b6cf"
    },
    {
      "path": "assets/source/table-04-v-pedestal/build_table_04_v_pedestal.mjs",
      "sha256": "bb09cc47ee88cc8a12cf729e1f67909b9ac1c526718b50f00d554c798eda08cc",
      "textSha256": "bb45482737053646a1fe643003b337af96718d7a02098d81a7482cf63159d91b"
    },
    {
      "path": "assets/source/table-04-v-pedestal/create_table_04_v_pedestal.py",
      "sha256": "e7a3f53ff962af123c8bc23920abbf63ea58a250a2714bfd69b8047656fac184",
      "textSha256": "2401e59ad0ed7436cf224efab7572984bd741504c64ca9f0c3571b27b02bd385"
    },
    {
      "path": "assets/source/table-04-v-pedestal/gltf-validator-report.json",
      "sha256": "52933b50259e49bc37f9a56c1f4ca55425382d368bbc582ad26ec4c207b8c28c",
      "textSha256": "52933b50259e49bc37f9a56c1f4ca55425382d368bbc582ad26ec4c207b8c28c"
    },
    {
      "path": "assets/source/table-04-v-pedestal/model-passport.md",
      "sha256": "4c458126edbaa56f001be745b8389a91b72d019add24fb29cda52eec3ba4e053",
      "textSha256": "59709680838f5fdb00572aa639a7c8bca5c36538f56c300f46bfcc09d6e14feb"
    },
    {
      "path": "assets/source/table-04-v-pedestal/validation-report.md",
      "sha256": "aaab2a4884a0b5328ed3c0820cae3fa2dd2b06e57e274ae05bf59ebd3ad625f7",
      "textSha256": "708e2005ef225b830665c46cd5fd79f91c19ae981ab1c82a5d0efc26a8e69b08"
    },
    {
      "path": "assets/source/table-05-round-fluted-pedestal/README.md",
      "sha256": "c6474d9fe365979d0a3079a1b95ae28675ee216856373c965386a123a9620bb6",
      "textSha256": "c6474d9fe365979d0a3079a1b95ae28675ee216856373c965386a123a9620bb6"
    },
    {
      "path": "assets/source/table-05-round-fluted-pedestal/build_model.mjs",
      "sha256": "362a9b02ba2c79641038d3a1f5dbab536fd88330e2ddb65d48488fb707a9d860",
      "textSha256": "362a9b02ba2c79641038d3a1f5dbab536fd88330e2ddb65d48488fb707a9d860"
    },
    {
      "path": "assets/source/table-05-round-fluted-pedestal/create_model.py",
      "sha256": "4e0f2801c1a49943e44d6107b3705c036b88fb331eabe758649e57fc5d6ab581",
      "textSha256": "4e0f2801c1a49943e44d6107b3705c036b88fb331eabe758649e57fc5d6ab581"
    },
    {
      "path": "assets/source/table-05-round-fluted-pedestal/export_preview_states.ts",
      "sha256": "949bfcffc9a4aab74a51d2a254e4e645a5928f15e5248304aebbcfdca9a1b72e",
      "textSha256": "949bfcffc9a4aab74a51d2a254e4e645a5928f15e5248304aebbcfdca9a1b72e"
    },
    {
      "path": "assets/source/table-05-round-fluted-pedestal/gltf-validator-report.json",
      "sha256": "df1bacff235f2ec8d15574b4298f3df2e95c162db13e65a5c0c6c37244a1246f",
      "textSha256": "df1bacff235f2ec8d15574b4298f3df2e95c162db13e65a5c0c6c37244a1246f"
    },
    {
      "path": "assets/source/table-05-round-fluted-pedestal/mesh-source.json",
      "sha256": "8740a5147a5df12b71d4a76528923e474291fd34c818be62ddef7d9a455224c6",
      "textSha256": "8740a5147a5df12b71d4a76528923e474291fd34c818be62ddef7d9a455224c6"
    },
    {
      "path": "assets/source/table-05-round-fluted-pedestal/model-passport.md",
      "sha256": "64dd0f269ea2fbf634514ee44f977763c1788f4f74065fa02553ccc3ba95e4e9",
      "textSha256": "64dd0f269ea2fbf634514ee44f977763c1788f4f74065fa02553ccc3ba95e4e9"
    },
    {
      "path": "assets/source/table-05-round-fluted-pedestal/model-spec.json",
      "sha256": "45f90671ae89ff251d2be3a9eb8a256b3986f61b8a8fd14d0ef787a7fa2c5b8b",
      "textSha256": "45f90671ae89ff251d2be3a9eb8a256b3986f61b8a8fd14d0ef787a7fa2c5b8b"
    },
    {
      "path": "assets/source/table-05-round-fluted-pedestal/npm-build.log",
      "sha256": "1bc6fb758b2ba0eba45c47bf5662f69a60fd8c4d01f12b2867d81d349e0d714f",
      "textSha256": "1bc6fb758b2ba0eba45c47bf5662f69a60fd8c4d01f12b2867d81d349e0d714f"
    },
    {
      "path": "assets/source/table-05-round-fluted-pedestal/npm-test.log",
      "sha256": "33d5fd7628b73cae251725d74a0d8de4ba2675d06ac0c6f7e01d21682d440e52",
      "textSha256": "33d5fd7628b73cae251725d74a0d8de4ba2675d06ac0c6f7e01d21682d440e52"
    },
    {
      "path": "assets/source/table-05-round-fluted-pedestal/preview-states.json",
      "sha256": "63a744092710c797ac792d8f552b2d0e5f117b13fbe6fa817d07d3f5c2417453",
      "textSha256": "63a744092710c797ac792d8f552b2d0e5f117b13fbe6fa817d07d3f5c2417453"
    },
    {
      "path": "assets/source/table-05-round-fluted-pedestal/previews/base-connections-black-white.png",
      "sha256": "1b8aa93086b62edff73e494dc05408f7268f2be2bd59025768f09a23989aefd7",
      "textSha256": null
    },
    {
      "path": "assets/source/table-05-round-fluted-pedestal/previews/base.png",
      "sha256": "1f88697b874747f9463bef06e4d1515449b293927b07d56d0aa4c7388dcf35cf",
      "textSha256": null
    },
    {
      "path": "assets/source/table-05-round-fluted-pedestal/previews/intermediate.png",
      "sha256": "9766e7afb8902c6a713073dc0bd4a842f5b6d8f100af9586ff8b698f376a420d",
      "textSha256": null
    },
    {
      "path": "assets/source/table-05-round-fluted-pedestal/previews/max.png",
      "sha256": "f6f95015729db9dc05b572f410de95af8578fba5bd0987b726cfaf87d3bdfb4b",
      "textSha256": null
    },
    {
      "path": "assets/source/table-05-round-fluted-pedestal/previews/return-base.png",
      "sha256": "6eed272f573da252b0a442a4a8a551f89018c2461f4c353dee2a0c9da474ab0c",
      "textSha256": null
    },
    {
      "path": "assets/source/table-05-round-fluted-pedestal/references/README.md",
      "sha256": "d89ef6eb15b61f0863fcb2ef9fa188ff5fc704f876d470b337087feea2bad70e",
      "textSha256": "d89ef6eb15b61f0863fcb2ef9fa188ff5fc704f876d470b337087feea2bad70e"
    },
    {
      "path": "assets/source/table-05-round-fluted-pedestal/references/integration-requirements.png",
      "sha256": "d8311882e9bc260f438e208a7bd62bb0976ad71719f72a0688c022cab9764589",
      "textSha256": null
    },
    {
      "path": "assets/source/table-05-round-fluted-pedestal/references/product-dimensions.jpg",
      "sha256": "deadadb8ebcba280f60d4a8301e5525284a984cb3ff1779ef76f7d71078a236e",
      "textSha256": null
    },
    {
      "path": "assets/source/table-05-round-fluted-pedestal/render_previews.py",
      "sha256": "8c828229bb65ce849802bedcc0f68bd1a9a047dd2cca64a1eb1fef48745e2382",
      "textSha256": "8c828229bb65ce849802bedcc0f68bd1a9a047dd2cca64a1eb1fef48745e2382"
    },
    {
      "path": "assets/source/table-05-round-fluted-pedestal/textures/base-color.jpg",
      "sha256": "8b42c56b3e10ea704cf19984904ec0f75fb96ef361e93cb515272ea55b9c0de4",
      "textSha256": null
    },
    {
      "path": "assets/source/table-05-round-fluted-pedestal/textures/metallic-roughness.png",
      "sha256": "cc90fe12668d219c9d6b67d115f547ce49211246b95270fc9b67208829b55f56",
      "textSha256": null
    },
    {
      "path": "assets/source/table-05-round-fluted-pedestal/textures/normal-gl.jpg",
      "sha256": "a1e50ac7ecfe6ccffb013a81f16a6eb48650a7b4f20fa9f2ad5718cc9508f106",
      "textSha256": null
    },
    {
      "path": "assets/source/table-05-round-fluted-pedestal/textures/roughness.jpg",
      "sha256": "dd99e0ef6a7d85ab9da313721dd30062cbf87a487422c0758258fcb38c424ad4",
      "textSha256": null
    },
    {
      "path": "assets/source/table-05-round-fluted-pedestal/validate_model.mjs",
      "sha256": "af5e82f2472069c4ce3faaeec2cb0f3dcb5b1f2e79fccf2e56f6e80018eeeea4",
      "textSha256": "af5e82f2472069c4ce3faaeec2cb0f3dcb5b1f2e79fccf2e56f6e80018eeeea4"
    },
    {
      "path": "assets/source/table-05-round-fluted-pedestal/validation-report.md",
      "sha256": "5f15957570668805bac4c1d9dac2af43fa6907e23394d780ca340a88f09df04a",
      "textSha256": "5f15957570668805bac4c1d9dac2af43fa6907e23394d780ca340a88f09df04a"
    },
    {
      "path": "assets/source/table-06-round-splayed-legs/README.md",
      "sha256": "3e0cdded6556da548d16676d499133a1b03978e7f1536a76c0ca5c0ddfe27e45",
      "textSha256": "3e0cdded6556da548d16676d499133a1b03978e7f1536a76c0ca5c0ddfe27e45"
    },
    {
      "path": "assets/source/table-06-round-splayed-legs/build_model.mjs",
      "sha256": "362a9b02ba2c79641038d3a1f5dbab536fd88330e2ddb65d48488fb707a9d860",
      "textSha256": "362a9b02ba2c79641038d3a1f5dbab536fd88330e2ddb65d48488fb707a9d860"
    },
    {
      "path": "assets/source/table-06-round-splayed-legs/create_model.py",
      "sha256": "4e0f2801c1a49943e44d6107b3705c036b88fb331eabe758649e57fc5d6ab581",
      "textSha256": "4e0f2801c1a49943e44d6107b3705c036b88fb331eabe758649e57fc5d6ab581"
    },
    {
      "path": "assets/source/table-06-round-splayed-legs/export_preview_states.ts",
      "sha256": "7a8ccbb2584c4b34dfbe57104b6f34b1cbd031c5e7fb1af76185202b47d0120f",
      "textSha256": "7a8ccbb2584c4b34dfbe57104b6f34b1cbd031c5e7fb1af76185202b47d0120f"
    },
    {
      "path": "assets/source/table-06-round-splayed-legs/gltf-validator-report.json",
      "sha256": "b8b395b53e0e77e5fd752c486a986faa93269be252e9f10875cf65654da0d57e",
      "textSha256": "b8b395b53e0e77e5fd752c486a986faa93269be252e9f10875cf65654da0d57e"
    },
    {
      "path": "assets/source/table-06-round-splayed-legs/mesh-source.json",
      "sha256": "a6dfaaa871fd4ece7bf9ec5bdbf03aa78493e6f94126f9e511c3a9157a5b8934",
      "textSha256": "a6dfaaa871fd4ece7bf9ec5bdbf03aa78493e6f94126f9e511c3a9157a5b8934"
    },
    {
      "path": "assets/source/table-06-round-splayed-legs/model-passport.md",
      "sha256": "47dd661646d1da4a891646cf2b075b719769004c9a811a12c1461adf3c10455c",
      "textSha256": "47dd661646d1da4a891646cf2b075b719769004c9a811a12c1461adf3c10455c"
    },
    {
      "path": "assets/source/table-06-round-splayed-legs/model-spec.json",
      "sha256": "86548bcad9d5170ff7341f8fba6c5f3ccb31918f7c952d27789d77a414ef96e6",
      "textSha256": "86548bcad9d5170ff7341f8fba6c5f3ccb31918f7c952d27789d77a414ef96e6"
    },
    {
      "path": "assets/source/table-06-round-splayed-legs/npm-build.log",
      "sha256": "1bc6fb758b2ba0eba45c47bf5662f69a60fd8c4d01f12b2867d81d349e0d714f",
      "textSha256": "1bc6fb758b2ba0eba45c47bf5662f69a60fd8c4d01f12b2867d81d349e0d714f"
    },
    {
      "path": "assets/source/table-06-round-splayed-legs/npm-test.log",
      "sha256": "33d5fd7628b73cae251725d74a0d8de4ba2675d06ac0c6f7e01d21682d440e52",
      "textSha256": "33d5fd7628b73cae251725d74a0d8de4ba2675d06ac0c6f7e01d21682d440e52"
    },
    {
      "path": "assets/source/table-06-round-splayed-legs/preview-states.json",
      "sha256": "f9bdb279bb3249e650de0416b170641a8166120ba3799cf3dbc06b88a51081c2",
      "textSha256": "f9bdb279bb3249e650de0416b170641a8166120ba3799cf3dbc06b88a51081c2"
    },
    {
      "path": "assets/source/table-06-round-splayed-legs/previews/base-connections-black-white.png",
      "sha256": "74d2ec156e0590b75b8cd31e36d311b1d102c48188521fd5ee4d0473ff29a034",
      "textSha256": null
    },
    {
      "path": "assets/source/table-06-round-splayed-legs/previews/base.png",
      "sha256": "c4be6294df8294c30a6496182eebf093476142dd7bbda07efba9781172ad9939",
      "textSha256": null
    },
    {
      "path": "assets/source/table-06-round-splayed-legs/previews/intermediate.png",
      "sha256": "fba50c695b8be9b94eb3d934a08fe151ece46a57d3ba4facefdc7db0b31d0118",
      "textSha256": null
    },
    {
      "path": "assets/source/table-06-round-splayed-legs/previews/max.png",
      "sha256": "524065da47ef99ec28740b78295ccada68030d98d0820fe1823140a17fe32459",
      "textSha256": null
    },
    {
      "path": "assets/source/table-06-round-splayed-legs/previews/return-base.png",
      "sha256": "509b3d1da35825f98fc85fa1fb4997df045c1bd4693265352e7779e28126fd53",
      "textSha256": null
    },
    {
      "path": "assets/source/table-06-round-splayed-legs/references/README.md",
      "sha256": "d89ef6eb15b61f0863fcb2ef9fa188ff5fc704f876d470b337087feea2bad70e",
      "textSha256": "d89ef6eb15b61f0863fcb2ef9fa188ff5fc704f876d470b337087feea2bad70e"
    },
    {
      "path": "assets/source/table-06-round-splayed-legs/references/integration-requirements.png",
      "sha256": "d8311882e9bc260f438e208a7bd62bb0976ad71719f72a0688c022cab9764589",
      "textSha256": null
    },
    {
      "path": "assets/source/table-06-round-splayed-legs/references/product-dimensions.jpg",
      "sha256": "ecffff35250e8dae4dda88daa170f46a4bb2739071691cc70faf6a33bf00d9ae",
      "textSha256": null
    },
    {
      "path": "assets/source/table-06-round-splayed-legs/render_previews.py",
      "sha256": "8c828229bb65ce849802bedcc0f68bd1a9a047dd2cca64a1eb1fef48745e2382",
      "textSha256": "8c828229bb65ce849802bedcc0f68bd1a9a047dd2cca64a1eb1fef48745e2382"
    },
    {
      "path": "assets/source/table-06-round-splayed-legs/textures/base-color.jpg",
      "sha256": "d403786171716f86718bdd67eba923d4fb6125c0636bacef0e6a21dd5d623a48",
      "textSha256": null
    },
    {
      "path": "assets/source/table-06-round-splayed-legs/textures/metallic-roughness.png",
      "sha256": "b9cfbf239804c48ff6eba8d55713a02a79f1a3c88519abb1e7e479d633c5cb95",
      "textSha256": null
    },
    {
      "path": "assets/source/table-06-round-splayed-legs/textures/normal-gl.jpg",
      "sha256": "d5e17ccb2913adbf28fcb781fddf0aa711259ddea6c1c918442f9a3589aa4660",
      "textSha256": null
    },
    {
      "path": "assets/source/table-06-round-splayed-legs/textures/roughness.jpg",
      "sha256": "1b970e033856c93ee7390d947da5340e101b489fc8c1463354ea9e6655ce039a",
      "textSha256": null
    },
    {
      "path": "assets/source/table-06-round-splayed-legs/validate_model.mjs",
      "sha256": "af5e82f2472069c4ce3faaeec2cb0f3dcb5b1f2e79fccf2e56f6e80018eeeea4",
      "textSha256": "af5e82f2472069c4ce3faaeec2cb0f3dcb5b1f2e79fccf2e56f6e80018eeeea4"
    },
    {
      "path": "assets/source/table-06-round-splayed-legs/validation-report.md",
      "sha256": "722b89dd483415d6af245dc56049c311169bbc778362674e10bb3638e1ab1cad",
      "textSha256": "722b89dd483415d6af245dc56049c311169bbc778362674e10bb3638e1ab1cad"
    },
    {
      "path": "docs/updates/material-uv-fixes-v3.md",
      "sha256": "7e13e4d8d2d59725d912bb82ea9378df053a21fff799b888eecfed4e4cdc182d",
      "textSha256": "7e13e4d8d2d59725d912bb82ea9378df053a21fff799b888eecfed4e4cdc182d"
    },
    {
      "path": "docs/updates/round-tables-05-06-integration.md",
      "sha256": "9ad73a44520b6643841bc2c0accea795624c5cf7f329985c24f7f7fc5f2952c0",
      "textSha256": "9ad73a44520b6643841bc2c0accea795624c5cf7f329985c24f7f7fc5f2952c0"
    },
    {
      "path": "docs/updates/round-tables-05-06-source-review/MODEL_PACKAGE_BLOCKER.md",
      "sha256": "5d830523c61f230a3a3c7853fc98312b78e3aff62ffbfd63eeeebccb924931cf",
      "textSha256": "5d830523c61f230a3a3c7853fc98312b78e3aff62ffbfd63eeeebccb924931cf"
    },
    {
      "path": "docs/updates/round-tables-05-06-source-review/MODEL_PACKAGE_MANIFEST.md",
      "sha256": "d7922e3a2f178873689877aa2f5dd2aa2a7bef4270d676b215c32b820fad2870",
      "textSha256": "d7922e3a2f178873689877aa2f5dd2aa2a7bef4270d676b215c32b820fad2870"
    },
    {
      "path": "docs/updates/round-tables-05-06-source-review/table-05-round-fluted-pedestal-validation-report.md",
      "sha256": "6112d437b525dd944095965ba71bed6cce1dd5eba86be24b086b6b460ad4b9af",
      "textSha256": "6112d437b525dd944095965ba71bed6cce1dd5eba86be24b086b6b460ad4b9af"
    },
    {
      "path": "docs/updates/round-tables-05-06-source-review/table-06-round-splayed-legs-validation-report.md",
      "sha256": "e572c04215641139d6c352bbe32b35eeb3ea09dfd3892005c61402c3e6a6d19b",
      "textSha256": "e572c04215641139d6c352bbe32b35eeb3ea09dfd3892005c61402c3e6a6d19b"
    },
    {
      "path": "public/materials/stone/marble-black-gold/base-color.jpg",
      "sha256": "8b42c56b3e10ea704cf19984904ec0f75fb96ef361e93cb515272ea55b9c0de4",
      "textSha256": null
    },
    {
      "path": "public/materials/stone/marble-black-gold/normal-gl.jpg",
      "sha256": "a1e50ac7ecfe6ccffb013a81f16a6eb48650a7b4f20fa9f2ad5718cc9508f106",
      "textSha256": null
    },
    {
      "path": "public/materials/stone/marble-black-gold/roughness.jpg",
      "sha256": "dd99e0ef6a7d85ab9da313721dd30062cbf87a487422c0758258fcb38c424ad4",
      "textSha256": null
    },
    {
      "path": "public/materials/stone/marble-duo-gold/base-color.jpg",
      "sha256": "b1b82180a3f24d060e2d72abbacb604c41e6b5b3d1736d4dedacf2464fdbe40c",
      "textSha256": null
    },
    {
      "path": "public/materials/stone/marble-duo-gold/normal-gl.jpg",
      "sha256": "622893a75895b2264ad4c4f06eb7c237a07b014f1e46f9b7ae91c38f0385525a",
      "textSha256": null
    },
    {
      "path": "public/materials/stone/marble-duo-gold/roughness.jpg",
      "sha256": "b251630bfed4565c75cda9ac2c4f45b81d11d8d26fb06ff13b645d3d04f45338",
      "textSha256": null
    },
    {
      "path": "public/materials/stone/marble-white-gold/base-color.jpg",
      "sha256": "22a3e353f66c647e6e0c2a13cb59e37b4d8f34e352cf97b0cce207a706f5ce58",
      "textSha256": null
    },
    {
      "path": "public/materials/stone/marble-white-gold/normal-gl.jpg",
      "sha256": "73fb6990ab2ffc3299b0f12619ba72ff0933f5a39681a0c0e1029c082bd6dd84",
      "textSha256": null
    },
    {
      "path": "public/materials/stone/marble-white-gold/roughness.jpg",
      "sha256": "220e23d198b59f0cd46fc4939328abebaa013d65179e7dc2b4c9e2ea6cfdd7ba",
      "textSha256": null
    },
    {
      "path": "public/materials/stone/terrazzo-neutral/base-color.jpg",
      "sha256": "93f86f21687681bf50e3bb1f86b62eb21f4921ac25347e89620dba09ad37c712",
      "textSha256": null
    },
    {
      "path": "public/materials/stone/terrazzo-neutral/normal-gl.jpg",
      "sha256": "c0d34140bfff7f77ba2ecbc99f1e161b5cb0650e4b4b2c180e703b14909b1ca9",
      "textSha256": null
    },
    {
      "path": "public/materials/stone/terrazzo-neutral/roughness.jpg",
      "sha256": "52c227a5b419296a39039641b2e879d3188f512b7ff2c1ce85211dbaf400aaf8",
      "textSha256": null
    },
    {
      "path": "public/materials/wood/oak-black/base-color.jpg",
      "sha256": "312aae3c5133521da39c5680459a4dffd175a8dab0daedf907114cebf81495e0",
      "textSha256": null
    },
    {
      "path": "public/materials/wood/oak-black/normal-gl.jpg",
      "sha256": "aa6ff34f725c15ce416200b5a0ed104dd8a86477ad70163d85f3439aec416808",
      "textSha256": null
    },
    {
      "path": "public/materials/wood/oak-black/roughness.jpg",
      "sha256": "0c45d3c40df7448bb52fda8c47ede5e1a0db2edd0c85edd59fa16a6e058a7708",
      "textSha256": null
    },
    {
      "path": "public/materials/wood/oak-grey/base-color.jpg",
      "sha256": "7aaa81ef7fc776c0db794085af5c093f52aa68d458f69d64c8af2f5b9129bb6e",
      "textSha256": null
    },
    {
      "path": "public/materials/wood/oak-grey/normal-gl.jpg",
      "sha256": "aa6ff34f725c15ce416200b5a0ed104dd8a86477ad70163d85f3439aec416808",
      "textSha256": null
    },
    {
      "path": "public/materials/wood/oak-grey/roughness.jpg",
      "sha256": "b5d2b0bab72b3b8050fc1361ffeef7e6be725bcec645c29d652d4fc23141c0f4",
      "textSha256": null
    },
    {
      "path": "public/materials/wood/oak-silver/base-color.jpg",
      "sha256": "1e47d6fa57a92889fa4a8ba4af091234b815bf3567568174571b7fc283e2349f",
      "textSha256": null
    },
    {
      "path": "public/materials/wood/oak-silver/normal-gl.jpg",
      "sha256": "aa6ff34f725c15ce416200b5a0ed104dd8a86477ad70163d85f3439aec416808",
      "textSha256": null
    },
    {
      "path": "public/materials/wood/oak-silver/roughness.jpg",
      "sha256": "17e92533bce1cb47ced318773c53c8333967bd1f0342552759cf9de819e92c7e",
      "textSha256": null
    },
    {
      "path": "public/models/table-02-u-frame.glb",
      "sha256": "3dd420ddbeeae5ee8a91ceb19bf1599998448772753dabdd1721f893c4205293",
      "textSha256": null
    },
    {
      "path": "public/models/table-03-slat-pedestal.glb",
      "sha256": "5ffe90555fe64c161eb1eb7de48738233d19149a898468f192f1a2b16150ccd8",
      "textSha256": null
    },
    {
      "path": "public/models/table-04-v-pedestal.glb",
      "sha256": "cf6192eeacf91a9bf9ba4afd0c653ea0d35d37d4a2b48e35dafa1bfaf47be210",
      "textSha256": null
    },
    {
      "path": "public/models/table-05-round-fluted-pedestal.glb",
      "sha256": "b7dd9a612b372a05eebb4211b2a36061a1a11c164b1b13188b11e715d287830f",
      "textSha256": null
    },
    {
      "path": "public/models/table-06-round-splayed-legs.glb",
      "sha256": "d801ae3b427a41a4bb15901ff100e64bfbdaed570c0d9a7342dbcf255227da62",
      "textSha256": null
    },
    {
      "path": "src/configurator/furnitureRegistry.ts",
      "sha256": "6c30305676452365be0cecf0747bf42c285a7a36461c1bdfa07ab5e9d74295b0",
      "textSha256": "ac67be67d492c74fe2173aee6c480d95a9662b13b936e0d7f1e0d9c31c402e96"
    },
    {
      "path": "src/three/furniture/furnitureController.test.ts",
      "sha256": "bbb563c8c3bddc3619848f3278e80de2ef50595d4964299d87332a84e9263ff4",
      "textSha256": "fcb7f83ac3729e4f26913612b0194ba24ce051f7df9c571934356726fd185e76"
    },
    {
      "path": "src/three/furniture/furnitureController.ts",
      "sha256": "d86e2faaba5262912b0a9ed8bab0e6422b19837f9f2361575375dd878160da9f",
      "textSha256": "13f26f9846710a7fc6f0c897f32100c4f69af5f25d5dec4f4ad60e19bfc32c28"
    },
    {
      "path": "src/three/materials/materialRefresh.integration.test.ts",
      "sha256": "b63139d7039f8dcd07c49ae06c8cd68aca80e7aba906c4096b65c2ec6a7a39d7",
      "textSha256": "b63139d7039f8dcd07c49ae06c8cd68aca80e7aba906c4096b65c2ec6a7a39d7"
    },
    {
      "path": "src/three/materials/materialRegistry.ts",
      "sha256": "70efcc6a07cb5fd800d5c66100ae907306c0cc2b5a487ff84f5f76165b9040ba",
      "textSha256": "59c3e4b32c0833fd026f73158a8290831c5423f3d0f403d27e95b93145eaf4ce"
    },
    {
      "path": "src/three/materials/materialSystem.integration.test.ts",
      "sha256": "7a81e452a80419dd86a2ba9339b25d51a28f5561f7b3427986830293ee8e43ef",
      "textSha256": "290a4fecb9f2ef254d1df62371811f2b9c4e66b1deec50b321688387f1450d95"
    },
    {
      "path": "src/three/models/first-table/config.ts",
      "sha256": "2c356af9773315f65b9aa15809666e6816c9cd67b04d3fdd3bb2f76fdc0e055b",
      "textSha256": "63421ef771400ef6fc0f413e0ad73571a80b5ba31e6be309bf16ec0936986b17"
    },
    {
      "path": "src/three/models/round-fluted-pedestal-table/config.ts",
      "sha256": "b2278f95dfc4a15bd44e4e6af3fb667589878fc4760b5af6966a9051b70087c0",
      "textSha256": "b2278f95dfc4a15bd44e4e6af3fb667589878fc4760b5af6966a9051b70087c0"
    },
    {
      "path": "src/three/models/round-fluted-pedestal-table/roundTable.test.ts",
      "sha256": "1a8439397b1d6da40aa90ebe7136ab821c615ce063b84439fe55cbaff212f7e0",
      "textSha256": "1a8439397b1d6da40aa90ebe7136ab821c615ce063b84439fe55cbaff212f7e0"
    },
    {
      "path": "src/three/models/round-splayed-legs-table/config.ts",
      "sha256": "dc99896f608bc1e4c19804ca41d1dd73e3b65bf9cd9568c9ac9f1d8392e9b3ea",
      "textSha256": "dc99896f608bc1e4c19804ca41d1dd73e3b65bf9cd9568c9ac9f1d8392e9b3ea"
    },
    {
      "path": "src/three/models/round-splayed-legs-table/roundTable.test.ts",
      "sha256": "2591e9151cf0c8e0c38996b66e1edac592fdf015571f5222bff3d4789f890592",
      "textSha256": "2591e9151cf0c8e0c38996b66e1edac592fdf015571f5222bff3d4789f890592"
    },
    {
      "path": "src/three/models/slat-pedestal-table/config.ts",
      "sha256": "f73c4ffafe2f0204dc67890ce99d93f545c058418a4ca6f11b1f433df631f72d",
      "textSha256": "79ed9b26a898cd4138695d415fc67c52e060c060e95c18f152c0e2c96a3e6cb5"
    },
    {
      "path": "src/three/models/tabletopUv.integration.test.ts",
      "sha256": "6b270814e5a43c27d9de2bc820bc46f92d58a9c1056f87db897f6702a7298fd2",
      "textSha256": "6b270814e5a43c27d9de2bc820bc46f92d58a9c1056f87db897f6702a7298fd2"
    },
    {
      "path": "src/three/models/u-frame-table/config.ts",
      "sha256": "9ade92dcdd2bc432fd835c888c35ba24d4d84036eca642f49401fb49bdd47c17",
      "textSha256": "9ade92dcdd2bc432fd835c888c35ba24d4d84036eca642f49401fb49bdd47c17"
    },
    {
      "path": "src/three/models/v-pedestal-table/config.ts",
      "sha256": "8c0343c4ac1910ec6fae066b38464496e4e36e8339fe43c09437e13b679cb72e",
      "textSha256": "2bc3d2a3ecb55e384a7fec2aebe30f7c49e566e495556521b90c748662f2ac21"
    },
    {
      "path": "src/three/models/v-pedestal-table/vPedestalTable.test.ts",
      "sha256": "aad2063a493c4350f4c116f0bcd1af51c98c7cd66398f231337426318663a756",
      "textSha256": "fc5d72747b04a38ab00291ef036ada181915333d2e775ef295f1ae8ab038d782"
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
  console.log('Furniture 3D Configurator: read-only round tables 05/06 integration check');
  const results = manifest.files.map(inspect);
  section('V1 + V2 + V3 + round tables 05/06 files', results);
  const count = results.filter(r => r.status === 'MATCH').length;
  console.log(`\nTOTAL: ${count}/${results.length} MATCH`);
  console.log(results.every(r => r.status === 'MATCH')
    ? 'RESULT: ROUND_TABLES_05_06_INTEGRATION_CONFIRMED'
    : 'RESULT: FILES_DIFFER_REVIEW_REQUIRED');
  console.log('This is a content check; browser acceptance and tests are separate.');
  console.log('\nGIT STATUS');
  git(['status', '--short', '--branch']);
  console.log('\nLAST 8 COMMITS');
  git(['log', '-8', '--oneline', '--decorate']);
}
