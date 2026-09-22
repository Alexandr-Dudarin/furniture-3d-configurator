import type { FurnitureDefinition } from '../../furniture/types'

export const catalogue: FurnitureDefinition = {
  ...{
  "id": "wardrobe-15-katania-four-door",
  "label": "Шкаф «Катания-4.2»",
  "modelUrl": "/models/wardrobe-15-katania-four-door.glb",
  "category": "wardrobes",
  "description": "Четыре рифлёных фасада, четыре отделения с торцевыми кронштейнами.",
  "framing": {
    "width": 2.4,
    "height": 2.7,
    "depth": 0.6
  },
  "dimensions": {
    "width": {
      "label": "Ширина",
      "base": 1.6,
      "min": 1.6,
      "max": 2.4,
      "step": 0.001,
      "displayUnit": "mm"
    },
    "height": {
      "label": "Высота",
      "base": 1.9,
      "min": 1.9,
      "max": 2.7,
      "step": 0.001,
      "displayUnit": "mm"
    },
    "depth": {
      "label": "Глубина",
      "base": 0.4,
      "defaultValue": 0.45,
      "min": 0.4,
      "max": 0.6,
      "step": 0.001,
      "displayUnit": "mm"
    }
  },
  "dimensionOrder": [
    "width",
    "height",
    "depth"
  ],
  "resizeRules": [],
  "textureAxes": {},
  "materialSlots": {
    "carcass": {
      "label": "Корпус и полки",
      "targets": [],
      "defaultFinish": "board-graphite-matte",
      "allowedFinishes": [
        "board-graphite-matte",
        "board-white-matte",
        "board-grey-neutral",
        "board-grey-cool",
        "board-cashmere-body",
        "board-cashmere-front",
        "oak-natural",
        "oak-grey",
        "oak-silver",
        "oak-black",
        "board-muted-green",
        "board-powder-beige"
      ]
    },
    "fronts": {
      "label": "Фасады",
      "targets": [],
      "defaultFinish": "board-graphite-matte",
      "allowedFinishes": [
        "board-graphite-matte",
        "board-white-matte",
        "board-grey-neutral",
        "board-grey-cool",
        "board-cashmere-body",
        "board-cashmere-front",
        "oak-natural",
        "oak-grey",
        "oak-silver",
        "oak-black",
        "board-muted-green",
        "board-powder-beige"
      ]
    },
    "hardware": {
      "label": "Ручки",
      "targets": [],
      "defaultFinish": "metal-black-matte",
      "allowedFinishes": [
        "metal-black-matte",
        "metal-white-matte",
        "metal-anthracite",
        "metal-brass-satin"
      ]
    }
  },
  "interiorView": {
    "hiddenNodes": [
      "Door_01_Hinge",
      "Door_02_Hinge",
      "Door_03_Hinge",
      "Door_04_Hinge"
    ]
  },
  "articulations": [
    {
      "id": "Door_01_Hinge",
      "label": "Дверь 1",
      "target": "Door_01_Hinge",
      "kind": "door",
      "angle": -105
    },
    {
      "id": "Door_02_Hinge",
      "label": "Дверь 2",
      "target": "Door_02_Hinge",
      "kind": "door",
      "angle": -105
    },
    {
      "id": "Door_03_Hinge",
      "label": "Дверь 3",
      "target": "Door_03_Hinge",
      "kind": "door",
      "angle": 105
    },
    {
      "id": "Door_04_Hinge",
      "label": "Дверь 4",
      "target": "Door_04_Hinge",
      "kind": "door",
      "angle": 105
    }
  ]
},
  loadRuntime: () => import('./runtime').then(module => module.definition),
}
