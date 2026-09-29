import { WARDROBE_HANDLES } from '../../../configurator/handles'
import type { FurnitureDefinition } from '../../furniture/types'

export const catalogue: FurnitureDefinition = {
  handles: WARDROBE_HANDLES['wardrobe-15-katania-four-door'],
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
      "base": 0.45,
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
  ],
  "facades": {
    "defaultStyle": "original",
    "styles": [
      "original",
      "smooth",
      "frame",
      "fluted",
      "fluted-sides",
      "diagonal",
      "herringbone",
      "diamonds",
      "herringbone-wide"
    ],
    "targets": [
      {
        "panel": "Door_01_Panel",
        "width": {
          "base": 0.3970000000000001,
          "dimension": "width",
          "factor": 0.25
        },
        "height": {
          "base": 1.847,
          "dimension": "height",
          "factor": 1
        },
        "thickness": 0.018
      },
      {
        "panel": "Door_02_Panel",
        "width": {
          "base": 0.397,
          "dimension": "width",
          "factor": 0.25
        },
        "height": {
          "base": 1.847,
          "dimension": "height",
          "factor": 1
        },
        "thickness": 0.018
      },
      {
        "panel": "Door_03_Panel",
        "width": {
          "base": 0.39700000000000013,
          "dimension": "width",
          "factor": 0.25
        },
        "height": {
          "base": 1.847,
          "dimension": "height",
          "factor": 1
        },
        "thickness": 0.018
      },
      {
        "panel": "Door_04_Panel",
        "width": {
          "base": 0.39699999999999996,
          "dimension": "width",
          "factor": 0.25
        },
        "height": {
          "base": 1.847,
          "dimension": "height",
          "factor": 1
        },
        "thickness": 0.018
      }
    ],
    "materialSlot": "fronts",
    "bevel": 0.0007,
    "frame": {
      "width": 0.045,
      "depth": 0.003,
      "slope": 0.002,
      "minField": 0.04
    },
    "fluted": {
      "pitch": 0.02,
      "width": 0.006,
      "depth": 0.0015,
      "margin": 0.032,
      "endMargin": 0.02,
      "fade": 0.003
    },
    "sourceStyle": "original",
    "batchSolidSource": true,
    "sourceRelief": { "width": 0.003, "depth": 0.0018 },
    "diagonal": {
      "pitch": 0.08,
      "width": 0.006,
      "depth": 0.0015,
      "margin": 0.032,
      "endMargin": 0.02,
      "minLength": 0.024
    },
    "herringbone": {
      "pitch": 0.08,
      "width": 0.006,
      "depth": 0.0015,
      "margin": 0.032,
      "endMargin": 0.02,
      "minLength": 0.024,
      "centerGap": 0.012
    },
    "diamonds": {
      "pitch": 0.08,
      "width": 0.006,
      "depth": 0.0015,
      "margin": 0.032,
      "endMargin": 0.02,
      "fade": 0.006
    }
  }
},
  loadRuntime: () => import('./runtime').then(module => module.definition),
}
