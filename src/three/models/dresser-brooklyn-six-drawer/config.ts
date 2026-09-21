import type { FurnitureDefinition } from '../../furniture/types'

// Model-only geometry review. Полные покрытия и affine UV подключаются централизованно.
export const DRESSER_12_CONFIG = {
  "id": "dresser-12-brooklyn-six-drawer",
  "label": "Комод «Бруклин»",
  "modelUrl": "/models/dresser-12-brooklyn-six-drawer.glb",
  "dimensions": {
    "width": {
      "label": "Ширина",
      "base": 1.6,
      "min": 1.2,
      "max": 2,
      "step": 0.001
    },
    "height": {
      "label": "Высота",
      "base": 0.68,
      "min": 0.55,
      "max": 0.9,
      "step": 0.001
    },
    "depth": {
      "label": "Глубина",
      "base": 0.45,
      "min": 0.35,
      "max": 0.6,
      "step": 0.001
    }
  },
  "dimensionOrder": [
    "width",
    "height",
    "depth"
  ],
  "resizeRules": [
    {
      "type": "stretch-segment",
      "target": "Panel_Top_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4246,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Top_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4246,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Top_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5986,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Top_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5986,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Top_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4246,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Top_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5986,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Left_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4046,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Left_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.6526,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Left_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.6526,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Left_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4046,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Left_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.6526,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Left_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4046,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Right_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4046,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Right_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.6526,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Right_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.6526,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Right_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4046,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Right_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.6526,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Right_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4046,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Bottom_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4006,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Bottom_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4006,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Bottom_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5646,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Bottom_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5646,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Bottom_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4006,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Bottom_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5646,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Back_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.6526,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Back_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.6526,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Back_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5646,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Back_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5646,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Back_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5646,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Back_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.6526,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_1_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4006,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_1_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.6366,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_1_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.6366,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_1_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4006,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_1_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.6366,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_1_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4006,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Front_Core_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.2066,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Front_Core_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.2066,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Front_Core_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7936,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Front_Core_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7936,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Front_Core_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7936,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Front_Core_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.2066,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Bottom_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Bottom_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Bottom_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7476,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Bottom_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7476,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Bottom_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Bottom_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7476,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Left_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Left_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Left_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Left_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Left_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Left_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Slide_Fixed_Left",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.365,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Slide_Moving_Left",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.355,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Right_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Right_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Right_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Right_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Right_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Right_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Slide_Fixed_Right",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.365,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Slide_Moving_Right",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.355,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Back_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Back_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Back_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Back_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Back_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Back_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Inner_Front_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Inner_Front_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Inner_Front_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Inner_Front_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Inner_Front_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Inner_Front_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Front_Core_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.2066,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Front_Core_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.2066,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Front_Core_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7936,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Front_Core_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7936,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Front_Core_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7936,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Front_Core_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.2066,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Bottom_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Bottom_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Bottom_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7476,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Bottom_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7476,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Bottom_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Bottom_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7476,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Left_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Left_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Left_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Left_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Left_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Left_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Slide_Fixed_Left",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.365,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Slide_Moving_Left",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.355,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Right_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Right_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Right_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Right_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Right_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Right_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Slide_Fixed_Right",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.365,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Slide_Moving_Right",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.355,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Back_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Back_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Back_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Back_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Back_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Back_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Inner_Front_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Inner_Front_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Inner_Front_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Inner_Front_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Inner_Front_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Inner_Front_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Front_Core_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.2066,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Front_Core_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.2066,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Front_Core_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7936,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Front_Core_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7936,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Front_Core_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7936,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Front_Core_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.2066,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Bottom_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Bottom_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Bottom_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7476,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Bottom_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7476,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Bottom_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Bottom_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7476,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Left_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Left_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Left_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Left_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Left_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Left_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Slide_Fixed_Left",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.365,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Slide_Moving_Left",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.355,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Right_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Right_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Right_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Right_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Right_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Right_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Slide_Fixed_Right",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.365,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Slide_Moving_Right",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.355,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Back_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Back_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Back_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Back_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Back_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Back_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Inner_Front_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Inner_Front_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Inner_Front_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Inner_Front_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Inner_Front_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Inner_Front_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Front_Core_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.2066,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Front_Core_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.2066,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Front_Core_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7936,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Front_Core_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7936,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Front_Core_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7936,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Front_Core_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.2066,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Bottom_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Bottom_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Bottom_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7476,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Bottom_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7476,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Bottom_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Bottom_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7476,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Side_Left_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Side_Left_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Side_Left_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Side_Left_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Side_Left_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Side_Left_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Slide_Fixed_Left",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.365,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Slide_Moving_Left",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.355,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Side_Right_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Side_Right_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Side_Right_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Side_Right_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Side_Right_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Side_Right_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Slide_Fixed_Right",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.365,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Slide_Moving_Right",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.355,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Back_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Back_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Back_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Back_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Back_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Back_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Inner_Front_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Inner_Front_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Inner_Front_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Inner_Front_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Inner_Front_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Inner_Front_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Front_Core_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.2066,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Front_Core_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.2066,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Front_Core_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7936,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Front_Core_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7936,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Front_Core_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7936,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Front_Core_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.2066,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Bottom_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Bottom_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Bottom_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7476,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Bottom_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7476,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Bottom_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Bottom_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7476,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Side_Left_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Side_Left_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Side_Left_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Side_Left_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Side_Left_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Side_Left_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Slide_Fixed_Left",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.365,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Slide_Moving_Left",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.355,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Side_Right_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Side_Right_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Side_Right_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Side_Right_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Side_Right_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Side_Right_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Slide_Fixed_Right",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.365,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Slide_Moving_Right",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.355,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Back_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Back_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Back_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Back_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Back_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Back_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Inner_Front_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Inner_Front_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Inner_Front_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Inner_Front_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Inner_Front_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_05_Inner_Front_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Front_Core_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.2066,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Front_Core_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.2066,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Front_Core_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7936,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Front_Core_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7936,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Front_Core_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7936,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Front_Core_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.2066,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Bottom_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Bottom_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Bottom_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7476,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Bottom_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7476,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Bottom_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Bottom_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7476,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Side_Left_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Side_Left_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Side_Left_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Side_Left_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Side_Left_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Side_Left_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Slide_Fixed_Left",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.365,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Slide_Moving_Left",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.355,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Side_Right_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Side_Right_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Side_Right_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Side_Right_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Side_Right_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Side_Right_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3786,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Slide_Fixed_Right",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.365,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Slide_Moving_Right",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.355,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Back_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Back_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Back_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Back_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Back_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Back_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Inner_Front_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Inner_Front_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Inner_Front_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Inner_Front_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Inner_Front_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7156,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_06_Inner_Front_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1586,
      "factor": 0.3333333333333333
    },
    {
      "type": "delta-move",
      "dimension": "height",
      "axis": "y",
      "targets": [
        {
          "target": "Panel_Top",
          "factor": 1
        },
        {
          "target": "Panel_Side_Left",
          "factor": 0.5
        },
        {
          "target": "Panel_Side_Left_Tile_cpp",
          "factor": 0.5
        },
        {
          "target": "Panel_Side_Left_Tile_cpc",
          "factor": 0.5
        },
        {
          "target": "Panel_Side_Left_Tile_cpm",
          "factor": 0.5
        },
        {
          "target": "Panel_Side_Left_Tile_cmp",
          "factor": -0.5
        },
        {
          "target": "Panel_Side_Left_Tile_cmc",
          "factor": -0.5
        },
        {
          "target": "Panel_Side_Left_Tile_cmm",
          "factor": -0.5
        },
        {
          "target": "Panel_Side_Right",
          "factor": 0.5
        },
        {
          "target": "Panel_Side_Right_Tile_cpp",
          "factor": 0.5
        },
        {
          "target": "Panel_Side_Right_Tile_cpc",
          "factor": 0.5
        },
        {
          "target": "Panel_Side_Right_Tile_cpm",
          "factor": 0.5
        },
        {
          "target": "Panel_Side_Right_Tile_cmp",
          "factor": -0.5
        },
        {
          "target": "Panel_Side_Right_Tile_cmc",
          "factor": -0.5
        },
        {
          "target": "Panel_Side_Right_Tile_cmm",
          "factor": -0.5
        },
        {
          "target": "Panel_Back",
          "factor": 0.5
        },
        {
          "target": "Panel_Back_Tile_ppc",
          "factor": 0.5
        },
        {
          "target": "Panel_Back_Tile_pmc",
          "factor": -0.5
        },
        {
          "target": "Panel_Back_Tile_mpc",
          "factor": 0.5
        },
        {
          "target": "Panel_Back_Tile_mmc",
          "factor": -0.5
        },
        {
          "target": "Panel_Back_Tile_cpc",
          "factor": 0.5
        },
        {
          "target": "Panel_Back_Tile_cmc",
          "factor": -0.5
        },
        {
          "target": "Panel_Divider_1",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_1_Tile_cpp",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_1_Tile_cpc",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_1_Tile_cpm",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_1_Tile_cmp",
          "factor": -0.5
        },
        {
          "target": "Panel_Divider_1_Tile_cmc",
          "factor": -0.5
        },
        {
          "target": "Panel_Divider_1_Tile_cmm",
          "factor": -0.5
        },
        {
          "target": "Drawer_01_Front",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_01_Front_Core_Tile_ppc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_01_Front_Core_Tile_pmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_01_Front_Core_Tile_mpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_01_Front_Core_Tile_mmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_01_Front_Core_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_01_Front_Core_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_01_Side_Left",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_01_Side_Left_Tile_cpp",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_01_Side_Left_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_01_Side_Left_Tile_cpm",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_01_Side_Left_Tile_cmp",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_01_Side_Left_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_01_Side_Left_Tile_cmm",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_01_Side_Right",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_01_Side_Right_Tile_cpp",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_01_Side_Right_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_01_Side_Right_Tile_cpm",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_01_Side_Right_Tile_cmp",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_01_Side_Right_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_01_Side_Right_Tile_cmm",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_01_Back",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_01_Back_Tile_ppc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_01_Back_Tile_pmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_01_Back_Tile_mpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_01_Back_Tile_mmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_01_Back_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_01_Back_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_01_Inner_Front",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_01_Inner_Front_Tile_ppc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_01_Inner_Front_Tile_pmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_01_Inner_Front_Tile_mpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_01_Inner_Front_Tile_mmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_01_Inner_Front_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_01_Inner_Front_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_01_Handle",
          "factor": 0.333333333333
        },
        {
          "target": "Drawer_02_Assembly",
          "factor": 0.333333333333
        },
        {
          "target": "Drawer_02_Front",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_02_Front_Core_Tile_ppc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_02_Front_Core_Tile_pmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_02_Front_Core_Tile_mpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_02_Front_Core_Tile_mmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_02_Front_Core_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_02_Front_Core_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_02_Side_Left",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_02_Side_Left_Tile_cpp",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_02_Side_Left_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_02_Side_Left_Tile_cpm",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_02_Side_Left_Tile_cmp",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_02_Side_Left_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_02_Side_Left_Tile_cmm",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_02_Slide_Fixed_Left",
          "factor": 0.333333333333
        },
        {
          "target": "Drawer_02_Side_Right",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_02_Side_Right_Tile_cpp",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_02_Side_Right_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_02_Side_Right_Tile_cpm",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_02_Side_Right_Tile_cmp",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_02_Side_Right_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_02_Side_Right_Tile_cmm",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_02_Slide_Fixed_Right",
          "factor": 0.333333333333
        },
        {
          "target": "Drawer_02_Back",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_02_Back_Tile_ppc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_02_Back_Tile_pmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_02_Back_Tile_mpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_02_Back_Tile_mmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_02_Back_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_02_Back_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_02_Inner_Front",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_02_Inner_Front_Tile_ppc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_02_Inner_Front_Tile_pmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_02_Inner_Front_Tile_mpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_02_Inner_Front_Tile_mmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_02_Inner_Front_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_02_Inner_Front_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_02_Handle",
          "factor": 0.333333333333
        },
        {
          "target": "Drawer_03_Assembly",
          "factor": 0.666666666667
        },
        {
          "target": "Drawer_03_Front",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_03_Front_Core_Tile_ppc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_03_Front_Core_Tile_pmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_03_Front_Core_Tile_mpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_03_Front_Core_Tile_mmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_03_Front_Core_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_03_Front_Core_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_03_Side_Left",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_03_Side_Left_Tile_cpp",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_03_Side_Left_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_03_Side_Left_Tile_cpm",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_03_Side_Left_Tile_cmp",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_03_Side_Left_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_03_Side_Left_Tile_cmm",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_03_Slide_Fixed_Left",
          "factor": 0.666666666667
        },
        {
          "target": "Drawer_03_Side_Right",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_03_Side_Right_Tile_cpp",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_03_Side_Right_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_03_Side_Right_Tile_cpm",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_03_Side_Right_Tile_cmp",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_03_Side_Right_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_03_Side_Right_Tile_cmm",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_03_Slide_Fixed_Right",
          "factor": 0.666666666667
        },
        {
          "target": "Drawer_03_Back",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_03_Back_Tile_ppc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_03_Back_Tile_pmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_03_Back_Tile_mpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_03_Back_Tile_mmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_03_Back_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_03_Back_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_03_Inner_Front",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_03_Inner_Front_Tile_ppc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_03_Inner_Front_Tile_pmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_03_Inner_Front_Tile_mpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_03_Inner_Front_Tile_mmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_03_Inner_Front_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_03_Inner_Front_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_03_Handle",
          "factor": 0.333333333333
        },
        {
          "target": "Drawer_04_Front",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_04_Front_Core_Tile_ppc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_04_Front_Core_Tile_pmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_04_Front_Core_Tile_mpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_04_Front_Core_Tile_mmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_04_Front_Core_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_04_Front_Core_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_04_Side_Left",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_04_Side_Left_Tile_cpp",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_04_Side_Left_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_04_Side_Left_Tile_cpm",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_04_Side_Left_Tile_cmp",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_04_Side_Left_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_04_Side_Left_Tile_cmm",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_04_Side_Right",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_04_Side_Right_Tile_cpp",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_04_Side_Right_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_04_Side_Right_Tile_cpm",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_04_Side_Right_Tile_cmp",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_04_Side_Right_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_04_Side_Right_Tile_cmm",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_04_Back",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_04_Back_Tile_ppc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_04_Back_Tile_pmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_04_Back_Tile_mpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_04_Back_Tile_mmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_04_Back_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_04_Back_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_04_Inner_Front",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_04_Inner_Front_Tile_ppc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_04_Inner_Front_Tile_pmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_04_Inner_Front_Tile_mpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_04_Inner_Front_Tile_mmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_04_Inner_Front_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_04_Inner_Front_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_04_Handle",
          "factor": 0.333333333333
        },
        {
          "target": "Drawer_05_Assembly",
          "factor": 0.333333333333
        },
        {
          "target": "Drawer_05_Front",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_05_Front_Core_Tile_ppc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_05_Front_Core_Tile_pmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_05_Front_Core_Tile_mpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_05_Front_Core_Tile_mmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_05_Front_Core_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_05_Front_Core_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_05_Side_Left",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_05_Side_Left_Tile_cpp",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_05_Side_Left_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_05_Side_Left_Tile_cpm",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_05_Side_Left_Tile_cmp",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_05_Side_Left_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_05_Side_Left_Tile_cmm",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_05_Slide_Fixed_Left",
          "factor": 0.333333333333
        },
        {
          "target": "Drawer_05_Side_Right",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_05_Side_Right_Tile_cpp",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_05_Side_Right_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_05_Side_Right_Tile_cpm",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_05_Side_Right_Tile_cmp",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_05_Side_Right_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_05_Side_Right_Tile_cmm",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_05_Slide_Fixed_Right",
          "factor": 0.333333333333
        },
        {
          "target": "Drawer_05_Back",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_05_Back_Tile_ppc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_05_Back_Tile_pmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_05_Back_Tile_mpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_05_Back_Tile_mmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_05_Back_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_05_Back_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_05_Inner_Front",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_05_Inner_Front_Tile_ppc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_05_Inner_Front_Tile_pmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_05_Inner_Front_Tile_mpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_05_Inner_Front_Tile_mmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_05_Inner_Front_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_05_Inner_Front_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_05_Handle",
          "factor": 0.333333333333
        },
        {
          "target": "Drawer_06_Assembly",
          "factor": 0.666666666667
        },
        {
          "target": "Drawer_06_Front",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_06_Front_Core_Tile_ppc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_06_Front_Core_Tile_pmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_06_Front_Core_Tile_mpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_06_Front_Core_Tile_mmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_06_Front_Core_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_06_Front_Core_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_06_Side_Left",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_06_Side_Left_Tile_cpp",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_06_Side_Left_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_06_Side_Left_Tile_cpm",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_06_Side_Left_Tile_cmp",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_06_Side_Left_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_06_Side_Left_Tile_cmm",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_06_Slide_Fixed_Left",
          "factor": 0.666666666667
        },
        {
          "target": "Drawer_06_Side_Right",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_06_Side_Right_Tile_cpp",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_06_Side_Right_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_06_Side_Right_Tile_cpm",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_06_Side_Right_Tile_cmp",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_06_Side_Right_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_06_Side_Right_Tile_cmm",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_06_Slide_Fixed_Right",
          "factor": 0.666666666667
        },
        {
          "target": "Drawer_06_Back",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_06_Back_Tile_ppc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_06_Back_Tile_pmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_06_Back_Tile_mpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_06_Back_Tile_mmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_06_Back_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_06_Back_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_06_Inner_Front",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_06_Inner_Front_Tile_ppc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_06_Inner_Front_Tile_pmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_06_Inner_Front_Tile_mpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_06_Inner_Front_Tile_mmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_06_Inner_Front_Tile_cpc",
          "factor": 0.166666666667
        },
        {
          "target": "Drawer_06_Inner_Front_Tile_cmc",
          "factor": -0.166666666667
        },
        {
          "target": "Drawer_06_Handle",
          "factor": 0.333333333333
        }
      ]
    },
    {
      "type": "delta-move",
      "dimension": "width",
      "axis": "x",
      "targets": [
        {
          "target": "Panel_Top_Tile_pcp",
          "factor": 0.5
        },
        {
          "target": "Panel_Top_Tile_pcc",
          "factor": 0.5
        },
        {
          "target": "Panel_Top_Tile_pcm",
          "factor": 0.5
        },
        {
          "target": "Panel_Top_Tile_mcm",
          "factor": -0.5
        },
        {
          "target": "Panel_Top_Tile_mcc",
          "factor": -0.5
        },
        {
          "target": "Panel_Top_Tile_mcp",
          "factor": -0.5
        },
        {
          "target": "Panel_Side_Left",
          "factor": -0.5
        },
        {
          "target": "Panel_Side_Right",
          "factor": 0.5
        },
        {
          "target": "Panel_Bottom_Tile_pcp",
          "factor": 0.5
        },
        {
          "target": "Panel_Bottom_Tile_pcc",
          "factor": 0.5
        },
        {
          "target": "Panel_Bottom_Tile_pcm",
          "factor": 0.5
        },
        {
          "target": "Panel_Bottom_Tile_mcm",
          "factor": -0.5
        },
        {
          "target": "Panel_Bottom_Tile_mcc",
          "factor": -0.5
        },
        {
          "target": "Panel_Bottom_Tile_mcp",
          "factor": -0.5
        },
        {
          "target": "Panel_Back_Tile_ppc",
          "factor": 0.5
        },
        {
          "target": "Panel_Back_Tile_pcc",
          "factor": 0.5
        },
        {
          "target": "Panel_Back_Tile_pmc",
          "factor": 0.5
        },
        {
          "target": "Panel_Back_Tile_mpc",
          "factor": -0.5
        },
        {
          "target": "Panel_Back_Tile_mcc",
          "factor": -0.5
        },
        {
          "target": "Panel_Back_Tile_mmc",
          "factor": -0.5
        },
        {
          "target": "Foot_0_0",
          "factor": -0.5
        },
        {
          "target": "Foot_0_1",
          "factor": -0.5
        },
        {
          "target": "Foot_2_0",
          "factor": 0.5
        },
        {
          "target": "Foot_2_1",
          "factor": 0.5
        },
        {
          "target": "Drawer_01_Assembly",
          "factor": -0.25
        },
        {
          "target": "Drawer_01_Front_Core_Tile_ppc",
          "factor": 0.25
        },
        {
          "target": "Drawer_01_Front_Core_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_01_Front_Core_Tile_pmc",
          "factor": 0.25
        },
        {
          "target": "Drawer_01_Front_Core_Tile_mpc",
          "factor": -0.25
        },
        {
          "target": "Drawer_01_Front_Core_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_01_Front_Core_Tile_mmc",
          "factor": -0.25
        },
        {
          "target": "Drawer_01_Bottom_Tile_pcp",
          "factor": 0.25
        },
        {
          "target": "Drawer_01_Bottom_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_01_Bottom_Tile_pcm",
          "factor": 0.25
        },
        {
          "target": "Drawer_01_Bottom_Tile_mcm",
          "factor": -0.25
        },
        {
          "target": "Drawer_01_Bottom_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_01_Bottom_Tile_mcp",
          "factor": -0.25
        },
        {
          "target": "Drawer_01_Side_Left",
          "factor": -0.25
        },
        {
          "target": "Drawer_01_Slide_Fixed_Left",
          "factor": -0.5
        },
        {
          "target": "Drawer_01_Slide_Moving_Left",
          "factor": -0.25
        },
        {
          "target": "Drawer_01_Side_Right",
          "factor": 0.25
        },
        {
          "target": "Drawer_01_Slide_Moving_Right",
          "factor": 0.25
        },
        {
          "target": "Drawer_01_Back_Tile_ppc",
          "factor": 0.25
        },
        {
          "target": "Drawer_01_Back_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_01_Back_Tile_pmc",
          "factor": 0.25
        },
        {
          "target": "Drawer_01_Back_Tile_mpc",
          "factor": -0.25
        },
        {
          "target": "Drawer_01_Back_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_01_Back_Tile_mmc",
          "factor": -0.25
        },
        {
          "target": "Drawer_01_Inner_Front_Tile_ppc",
          "factor": 0.25
        },
        {
          "target": "Drawer_01_Inner_Front_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_01_Inner_Front_Tile_pmc",
          "factor": 0.25
        },
        {
          "target": "Drawer_01_Inner_Front_Tile_mpc",
          "factor": -0.25
        },
        {
          "target": "Drawer_01_Inner_Front_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_01_Inner_Front_Tile_mmc",
          "factor": -0.25
        },
        {
          "target": "Drawer_02_Assembly",
          "factor": -0.25
        },
        {
          "target": "Drawer_02_Front_Core_Tile_ppc",
          "factor": 0.25
        },
        {
          "target": "Drawer_02_Front_Core_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_02_Front_Core_Tile_pmc",
          "factor": 0.25
        },
        {
          "target": "Drawer_02_Front_Core_Tile_mpc",
          "factor": -0.25
        },
        {
          "target": "Drawer_02_Front_Core_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_02_Front_Core_Tile_mmc",
          "factor": -0.25
        },
        {
          "target": "Drawer_02_Bottom_Tile_pcp",
          "factor": 0.25
        },
        {
          "target": "Drawer_02_Bottom_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_02_Bottom_Tile_pcm",
          "factor": 0.25
        },
        {
          "target": "Drawer_02_Bottom_Tile_mcm",
          "factor": -0.25
        },
        {
          "target": "Drawer_02_Bottom_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_02_Bottom_Tile_mcp",
          "factor": -0.25
        },
        {
          "target": "Drawer_02_Side_Left",
          "factor": -0.25
        },
        {
          "target": "Drawer_02_Slide_Fixed_Left",
          "factor": -0.5
        },
        {
          "target": "Drawer_02_Slide_Moving_Left",
          "factor": -0.25
        },
        {
          "target": "Drawer_02_Side_Right",
          "factor": 0.25
        },
        {
          "target": "Drawer_02_Slide_Moving_Right",
          "factor": 0.25
        },
        {
          "target": "Drawer_02_Back_Tile_ppc",
          "factor": 0.25
        },
        {
          "target": "Drawer_02_Back_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_02_Back_Tile_pmc",
          "factor": 0.25
        },
        {
          "target": "Drawer_02_Back_Tile_mpc",
          "factor": -0.25
        },
        {
          "target": "Drawer_02_Back_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_02_Back_Tile_mmc",
          "factor": -0.25
        },
        {
          "target": "Drawer_02_Inner_Front_Tile_ppc",
          "factor": 0.25
        },
        {
          "target": "Drawer_02_Inner_Front_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_02_Inner_Front_Tile_pmc",
          "factor": 0.25
        },
        {
          "target": "Drawer_02_Inner_Front_Tile_mpc",
          "factor": -0.25
        },
        {
          "target": "Drawer_02_Inner_Front_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_02_Inner_Front_Tile_mmc",
          "factor": -0.25
        },
        {
          "target": "Drawer_03_Assembly",
          "factor": -0.25
        },
        {
          "target": "Drawer_03_Front_Core_Tile_ppc",
          "factor": 0.25
        },
        {
          "target": "Drawer_03_Front_Core_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_03_Front_Core_Tile_pmc",
          "factor": 0.25
        },
        {
          "target": "Drawer_03_Front_Core_Tile_mpc",
          "factor": -0.25
        },
        {
          "target": "Drawer_03_Front_Core_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_03_Front_Core_Tile_mmc",
          "factor": -0.25
        },
        {
          "target": "Drawer_03_Bottom_Tile_pcp",
          "factor": 0.25
        },
        {
          "target": "Drawer_03_Bottom_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_03_Bottom_Tile_pcm",
          "factor": 0.25
        },
        {
          "target": "Drawer_03_Bottom_Tile_mcm",
          "factor": -0.25
        },
        {
          "target": "Drawer_03_Bottom_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_03_Bottom_Tile_mcp",
          "factor": -0.25
        },
        {
          "target": "Drawer_03_Side_Left",
          "factor": -0.25
        },
        {
          "target": "Drawer_03_Slide_Fixed_Left",
          "factor": -0.5
        },
        {
          "target": "Drawer_03_Slide_Moving_Left",
          "factor": -0.25
        },
        {
          "target": "Drawer_03_Side_Right",
          "factor": 0.25
        },
        {
          "target": "Drawer_03_Slide_Moving_Right",
          "factor": 0.25
        },
        {
          "target": "Drawer_03_Back_Tile_ppc",
          "factor": 0.25
        },
        {
          "target": "Drawer_03_Back_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_03_Back_Tile_pmc",
          "factor": 0.25
        },
        {
          "target": "Drawer_03_Back_Tile_mpc",
          "factor": -0.25
        },
        {
          "target": "Drawer_03_Back_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_03_Back_Tile_mmc",
          "factor": -0.25
        },
        {
          "target": "Drawer_03_Inner_Front_Tile_ppc",
          "factor": 0.25
        },
        {
          "target": "Drawer_03_Inner_Front_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_03_Inner_Front_Tile_pmc",
          "factor": 0.25
        },
        {
          "target": "Drawer_03_Inner_Front_Tile_mpc",
          "factor": -0.25
        },
        {
          "target": "Drawer_03_Inner_Front_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_03_Inner_Front_Tile_mmc",
          "factor": -0.25
        },
        {
          "target": "Drawer_04_Assembly",
          "factor": 0.25
        },
        {
          "target": "Drawer_04_Front_Core_Tile_ppc",
          "factor": 0.25
        },
        {
          "target": "Drawer_04_Front_Core_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_04_Front_Core_Tile_pmc",
          "factor": 0.25
        },
        {
          "target": "Drawer_04_Front_Core_Tile_mpc",
          "factor": -0.25
        },
        {
          "target": "Drawer_04_Front_Core_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_04_Front_Core_Tile_mmc",
          "factor": -0.25
        },
        {
          "target": "Drawer_04_Bottom_Tile_pcp",
          "factor": 0.25
        },
        {
          "target": "Drawer_04_Bottom_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_04_Bottom_Tile_pcm",
          "factor": 0.25
        },
        {
          "target": "Drawer_04_Bottom_Tile_mcm",
          "factor": -0.25
        },
        {
          "target": "Drawer_04_Bottom_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_04_Bottom_Tile_mcp",
          "factor": -0.25
        },
        {
          "target": "Drawer_04_Side_Left",
          "factor": -0.25
        },
        {
          "target": "Drawer_04_Slide_Moving_Left",
          "factor": -0.25
        },
        {
          "target": "Drawer_04_Side_Right",
          "factor": 0.25
        },
        {
          "target": "Drawer_04_Slide_Fixed_Right",
          "factor": 0.5
        },
        {
          "target": "Drawer_04_Slide_Moving_Right",
          "factor": 0.25
        },
        {
          "target": "Drawer_04_Back_Tile_ppc",
          "factor": 0.25
        },
        {
          "target": "Drawer_04_Back_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_04_Back_Tile_pmc",
          "factor": 0.25
        },
        {
          "target": "Drawer_04_Back_Tile_mpc",
          "factor": -0.25
        },
        {
          "target": "Drawer_04_Back_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_04_Back_Tile_mmc",
          "factor": -0.25
        },
        {
          "target": "Drawer_04_Inner_Front_Tile_ppc",
          "factor": 0.25
        },
        {
          "target": "Drawer_04_Inner_Front_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_04_Inner_Front_Tile_pmc",
          "factor": 0.25
        },
        {
          "target": "Drawer_04_Inner_Front_Tile_mpc",
          "factor": -0.25
        },
        {
          "target": "Drawer_04_Inner_Front_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_04_Inner_Front_Tile_mmc",
          "factor": -0.25
        },
        {
          "target": "Drawer_05_Assembly",
          "factor": 0.25
        },
        {
          "target": "Drawer_05_Front_Core_Tile_ppc",
          "factor": 0.25
        },
        {
          "target": "Drawer_05_Front_Core_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_05_Front_Core_Tile_pmc",
          "factor": 0.25
        },
        {
          "target": "Drawer_05_Front_Core_Tile_mpc",
          "factor": -0.25
        },
        {
          "target": "Drawer_05_Front_Core_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_05_Front_Core_Tile_mmc",
          "factor": -0.25
        },
        {
          "target": "Drawer_05_Bottom_Tile_pcp",
          "factor": 0.25
        },
        {
          "target": "Drawer_05_Bottom_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_05_Bottom_Tile_pcm",
          "factor": 0.25
        },
        {
          "target": "Drawer_05_Bottom_Tile_mcm",
          "factor": -0.25
        },
        {
          "target": "Drawer_05_Bottom_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_05_Bottom_Tile_mcp",
          "factor": -0.25
        },
        {
          "target": "Drawer_05_Side_Left",
          "factor": -0.25
        },
        {
          "target": "Drawer_05_Slide_Moving_Left",
          "factor": -0.25
        },
        {
          "target": "Drawer_05_Side_Right",
          "factor": 0.25
        },
        {
          "target": "Drawer_05_Slide_Fixed_Right",
          "factor": 0.5
        },
        {
          "target": "Drawer_05_Slide_Moving_Right",
          "factor": 0.25
        },
        {
          "target": "Drawer_05_Back_Tile_ppc",
          "factor": 0.25
        },
        {
          "target": "Drawer_05_Back_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_05_Back_Tile_pmc",
          "factor": 0.25
        },
        {
          "target": "Drawer_05_Back_Tile_mpc",
          "factor": -0.25
        },
        {
          "target": "Drawer_05_Back_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_05_Back_Tile_mmc",
          "factor": -0.25
        },
        {
          "target": "Drawer_05_Inner_Front_Tile_ppc",
          "factor": 0.25
        },
        {
          "target": "Drawer_05_Inner_Front_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_05_Inner_Front_Tile_pmc",
          "factor": 0.25
        },
        {
          "target": "Drawer_05_Inner_Front_Tile_mpc",
          "factor": -0.25
        },
        {
          "target": "Drawer_05_Inner_Front_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_05_Inner_Front_Tile_mmc",
          "factor": -0.25
        },
        {
          "target": "Drawer_06_Assembly",
          "factor": 0.25
        },
        {
          "target": "Drawer_06_Front_Core_Tile_ppc",
          "factor": 0.25
        },
        {
          "target": "Drawer_06_Front_Core_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_06_Front_Core_Tile_pmc",
          "factor": 0.25
        },
        {
          "target": "Drawer_06_Front_Core_Tile_mpc",
          "factor": -0.25
        },
        {
          "target": "Drawer_06_Front_Core_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_06_Front_Core_Tile_mmc",
          "factor": -0.25
        },
        {
          "target": "Drawer_06_Bottom_Tile_pcp",
          "factor": 0.25
        },
        {
          "target": "Drawer_06_Bottom_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_06_Bottom_Tile_pcm",
          "factor": 0.25
        },
        {
          "target": "Drawer_06_Bottom_Tile_mcm",
          "factor": -0.25
        },
        {
          "target": "Drawer_06_Bottom_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_06_Bottom_Tile_mcp",
          "factor": -0.25
        },
        {
          "target": "Drawer_06_Side_Left",
          "factor": -0.25
        },
        {
          "target": "Drawer_06_Slide_Moving_Left",
          "factor": -0.25
        },
        {
          "target": "Drawer_06_Side_Right",
          "factor": 0.25
        },
        {
          "target": "Drawer_06_Slide_Fixed_Right",
          "factor": 0.5
        },
        {
          "target": "Drawer_06_Slide_Moving_Right",
          "factor": 0.25
        },
        {
          "target": "Drawer_06_Back_Tile_ppc",
          "factor": 0.25
        },
        {
          "target": "Drawer_06_Back_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_06_Back_Tile_pmc",
          "factor": 0.25
        },
        {
          "target": "Drawer_06_Back_Tile_mpc",
          "factor": -0.25
        },
        {
          "target": "Drawer_06_Back_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_06_Back_Tile_mmc",
          "factor": -0.25
        },
        {
          "target": "Drawer_06_Inner_Front_Tile_ppc",
          "factor": 0.25
        },
        {
          "target": "Drawer_06_Inner_Front_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_06_Inner_Front_Tile_pmc",
          "factor": 0.25
        },
        {
          "target": "Drawer_06_Inner_Front_Tile_mpc",
          "factor": -0.25
        },
        {
          "target": "Drawer_06_Inner_Front_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_06_Inner_Front_Tile_mmc",
          "factor": -0.25
        }
      ]
    },
    {
      "type": "delta-move",
      "dimension": "depth",
      "axis": "z",
      "targets": [
        {
          "target": "Panel_Top_Tile_pcp",
          "factor": 0.5
        },
        {
          "target": "Panel_Top_Tile_pcm",
          "factor": -0.5
        },
        {
          "target": "Panel_Top_Tile_mcm",
          "factor": -0.5
        },
        {
          "target": "Panel_Top_Tile_mcp",
          "factor": 0.5
        },
        {
          "target": "Panel_Top_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Panel_Top_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Panel_Side_Left_Tile_cpp",
          "factor": 0.5
        },
        {
          "target": "Panel_Side_Left_Tile_cpm",
          "factor": -0.5
        },
        {
          "target": "Panel_Side_Left_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Panel_Side_Left_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Panel_Side_Left_Tile_cmp",
          "factor": 0.5
        },
        {
          "target": "Panel_Side_Left_Tile_cmm",
          "factor": -0.5
        },
        {
          "target": "Panel_Side_Right_Tile_cpp",
          "factor": 0.5
        },
        {
          "target": "Panel_Side_Right_Tile_cpm",
          "factor": -0.5
        },
        {
          "target": "Panel_Side_Right_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Panel_Side_Right_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Panel_Side_Right_Tile_cmp",
          "factor": 0.5
        },
        {
          "target": "Panel_Side_Right_Tile_cmm",
          "factor": -0.5
        },
        {
          "target": "Panel_Bottom_Tile_pcp",
          "factor": 0.5
        },
        {
          "target": "Panel_Bottom_Tile_pcm",
          "factor": -0.5
        },
        {
          "target": "Panel_Bottom_Tile_mcm",
          "factor": -0.5
        },
        {
          "target": "Panel_Bottom_Tile_mcp",
          "factor": 0.5
        },
        {
          "target": "Panel_Bottom_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Panel_Bottom_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Panel_Back",
          "factor": -0.5
        },
        {
          "target": "Panel_Divider_1_Tile_cpp",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_1_Tile_cpm",
          "factor": -0.5
        },
        {
          "target": "Panel_Divider_1_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_1_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Panel_Divider_1_Tile_cmp",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_1_Tile_cmm",
          "factor": -0.5
        },
        {
          "target": "Foot_0_0",
          "factor": -0.5
        },
        {
          "target": "Foot_0_1",
          "factor": 0.5
        },
        {
          "target": "Foot_1_0",
          "factor": -0.5
        },
        {
          "target": "Foot_1_1",
          "factor": 0.5
        },
        {
          "target": "Foot_2_0",
          "factor": -0.5
        },
        {
          "target": "Foot_2_1",
          "factor": 0.5
        },
        {
          "target": "Drawer_01_Front",
          "factor": 0.5
        },
        {
          "target": "Drawer_01_Bottom_Tile_pcp",
          "factor": 0.5
        },
        {
          "target": "Drawer_01_Bottom_Tile_pcm",
          "factor": -0.5
        },
        {
          "target": "Drawer_01_Bottom_Tile_mcm",
          "factor": -0.5
        },
        {
          "target": "Drawer_01_Bottom_Tile_mcp",
          "factor": 0.5
        },
        {
          "target": "Drawer_01_Bottom_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Drawer_01_Bottom_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Drawer_01_Side_Left_Tile_cpp",
          "factor": 0.5
        },
        {
          "target": "Drawer_01_Side_Left_Tile_cpm",
          "factor": -0.5
        },
        {
          "target": "Drawer_01_Side_Left_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Drawer_01_Side_Left_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Drawer_01_Side_Left_Tile_cmp",
          "factor": 0.5
        },
        {
          "target": "Drawer_01_Side_Left_Tile_cmm",
          "factor": -0.5
        },
        {
          "target": "Drawer_01_Side_Right_Tile_cpp",
          "factor": 0.5
        },
        {
          "target": "Drawer_01_Side_Right_Tile_cpm",
          "factor": -0.5
        },
        {
          "target": "Drawer_01_Side_Right_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Drawer_01_Side_Right_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Drawer_01_Side_Right_Tile_cmp",
          "factor": 0.5
        },
        {
          "target": "Drawer_01_Side_Right_Tile_cmm",
          "factor": -0.5
        },
        {
          "target": "Drawer_01_Back",
          "factor": -0.5
        },
        {
          "target": "Drawer_01_Inner_Front",
          "factor": 0.5
        },
        {
          "target": "Drawer_01_Handle",
          "factor": 0.5
        },
        {
          "target": "Drawer_02_Front",
          "factor": 0.5
        },
        {
          "target": "Drawer_02_Bottom_Tile_pcp",
          "factor": 0.5
        },
        {
          "target": "Drawer_02_Bottom_Tile_pcm",
          "factor": -0.5
        },
        {
          "target": "Drawer_02_Bottom_Tile_mcm",
          "factor": -0.5
        },
        {
          "target": "Drawer_02_Bottom_Tile_mcp",
          "factor": 0.5
        },
        {
          "target": "Drawer_02_Bottom_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Drawer_02_Bottom_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Drawer_02_Side_Left_Tile_cpp",
          "factor": 0.5
        },
        {
          "target": "Drawer_02_Side_Left_Tile_cpm",
          "factor": -0.5
        },
        {
          "target": "Drawer_02_Side_Left_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Drawer_02_Side_Left_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Drawer_02_Side_Left_Tile_cmp",
          "factor": 0.5
        },
        {
          "target": "Drawer_02_Side_Left_Tile_cmm",
          "factor": -0.5
        },
        {
          "target": "Drawer_02_Side_Right_Tile_cpp",
          "factor": 0.5
        },
        {
          "target": "Drawer_02_Side_Right_Tile_cpm",
          "factor": -0.5
        },
        {
          "target": "Drawer_02_Side_Right_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Drawer_02_Side_Right_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Drawer_02_Side_Right_Tile_cmp",
          "factor": 0.5
        },
        {
          "target": "Drawer_02_Side_Right_Tile_cmm",
          "factor": -0.5
        },
        {
          "target": "Drawer_02_Back",
          "factor": -0.5
        },
        {
          "target": "Drawer_02_Inner_Front",
          "factor": 0.5
        },
        {
          "target": "Drawer_02_Handle",
          "factor": 0.5
        },
        {
          "target": "Drawer_03_Front",
          "factor": 0.5
        },
        {
          "target": "Drawer_03_Bottom_Tile_pcp",
          "factor": 0.5
        },
        {
          "target": "Drawer_03_Bottom_Tile_pcm",
          "factor": -0.5
        },
        {
          "target": "Drawer_03_Bottom_Tile_mcm",
          "factor": -0.5
        },
        {
          "target": "Drawer_03_Bottom_Tile_mcp",
          "factor": 0.5
        },
        {
          "target": "Drawer_03_Bottom_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Drawer_03_Bottom_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Drawer_03_Side_Left_Tile_cpp",
          "factor": 0.5
        },
        {
          "target": "Drawer_03_Side_Left_Tile_cpm",
          "factor": -0.5
        },
        {
          "target": "Drawer_03_Side_Left_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Drawer_03_Side_Left_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Drawer_03_Side_Left_Tile_cmp",
          "factor": 0.5
        },
        {
          "target": "Drawer_03_Side_Left_Tile_cmm",
          "factor": -0.5
        },
        {
          "target": "Drawer_03_Side_Right_Tile_cpp",
          "factor": 0.5
        },
        {
          "target": "Drawer_03_Side_Right_Tile_cpm",
          "factor": -0.5
        },
        {
          "target": "Drawer_03_Side_Right_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Drawer_03_Side_Right_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Drawer_03_Side_Right_Tile_cmp",
          "factor": 0.5
        },
        {
          "target": "Drawer_03_Side_Right_Tile_cmm",
          "factor": -0.5
        },
        {
          "target": "Drawer_03_Back",
          "factor": -0.5
        },
        {
          "target": "Drawer_03_Inner_Front",
          "factor": 0.5
        },
        {
          "target": "Drawer_03_Handle",
          "factor": 0.5
        },
        {
          "target": "Drawer_04_Front",
          "factor": 0.5
        },
        {
          "target": "Drawer_04_Bottom_Tile_pcp",
          "factor": 0.5
        },
        {
          "target": "Drawer_04_Bottom_Tile_pcm",
          "factor": -0.5
        },
        {
          "target": "Drawer_04_Bottom_Tile_mcm",
          "factor": -0.5
        },
        {
          "target": "Drawer_04_Bottom_Tile_mcp",
          "factor": 0.5
        },
        {
          "target": "Drawer_04_Bottom_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Drawer_04_Bottom_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Drawer_04_Side_Left_Tile_cpp",
          "factor": 0.5
        },
        {
          "target": "Drawer_04_Side_Left_Tile_cpm",
          "factor": -0.5
        },
        {
          "target": "Drawer_04_Side_Left_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Drawer_04_Side_Left_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Drawer_04_Side_Left_Tile_cmp",
          "factor": 0.5
        },
        {
          "target": "Drawer_04_Side_Left_Tile_cmm",
          "factor": -0.5
        },
        {
          "target": "Drawer_04_Side_Right_Tile_cpp",
          "factor": 0.5
        },
        {
          "target": "Drawer_04_Side_Right_Tile_cpm",
          "factor": -0.5
        },
        {
          "target": "Drawer_04_Side_Right_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Drawer_04_Side_Right_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Drawer_04_Side_Right_Tile_cmp",
          "factor": 0.5
        },
        {
          "target": "Drawer_04_Side_Right_Tile_cmm",
          "factor": -0.5
        },
        {
          "target": "Drawer_04_Back",
          "factor": -0.5
        },
        {
          "target": "Drawer_04_Inner_Front",
          "factor": 0.5
        },
        {
          "target": "Drawer_04_Handle",
          "factor": 0.5
        },
        {
          "target": "Drawer_05_Front",
          "factor": 0.5
        },
        {
          "target": "Drawer_05_Bottom_Tile_pcp",
          "factor": 0.5
        },
        {
          "target": "Drawer_05_Bottom_Tile_pcm",
          "factor": -0.5
        },
        {
          "target": "Drawer_05_Bottom_Tile_mcm",
          "factor": -0.5
        },
        {
          "target": "Drawer_05_Bottom_Tile_mcp",
          "factor": 0.5
        },
        {
          "target": "Drawer_05_Bottom_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Drawer_05_Bottom_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Drawer_05_Side_Left_Tile_cpp",
          "factor": 0.5
        },
        {
          "target": "Drawer_05_Side_Left_Tile_cpm",
          "factor": -0.5
        },
        {
          "target": "Drawer_05_Side_Left_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Drawer_05_Side_Left_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Drawer_05_Side_Left_Tile_cmp",
          "factor": 0.5
        },
        {
          "target": "Drawer_05_Side_Left_Tile_cmm",
          "factor": -0.5
        },
        {
          "target": "Drawer_05_Side_Right_Tile_cpp",
          "factor": 0.5
        },
        {
          "target": "Drawer_05_Side_Right_Tile_cpm",
          "factor": -0.5
        },
        {
          "target": "Drawer_05_Side_Right_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Drawer_05_Side_Right_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Drawer_05_Side_Right_Tile_cmp",
          "factor": 0.5
        },
        {
          "target": "Drawer_05_Side_Right_Tile_cmm",
          "factor": -0.5
        },
        {
          "target": "Drawer_05_Back",
          "factor": -0.5
        },
        {
          "target": "Drawer_05_Inner_Front",
          "factor": 0.5
        },
        {
          "target": "Drawer_05_Handle",
          "factor": 0.5
        },
        {
          "target": "Drawer_06_Front",
          "factor": 0.5
        },
        {
          "target": "Drawer_06_Bottom_Tile_pcp",
          "factor": 0.5
        },
        {
          "target": "Drawer_06_Bottom_Tile_pcm",
          "factor": -0.5
        },
        {
          "target": "Drawer_06_Bottom_Tile_mcm",
          "factor": -0.5
        },
        {
          "target": "Drawer_06_Bottom_Tile_mcp",
          "factor": 0.5
        },
        {
          "target": "Drawer_06_Bottom_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Drawer_06_Bottom_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Drawer_06_Side_Left_Tile_cpp",
          "factor": 0.5
        },
        {
          "target": "Drawer_06_Side_Left_Tile_cpm",
          "factor": -0.5
        },
        {
          "target": "Drawer_06_Side_Left_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Drawer_06_Side_Left_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Drawer_06_Side_Left_Tile_cmp",
          "factor": 0.5
        },
        {
          "target": "Drawer_06_Side_Left_Tile_cmm",
          "factor": -0.5
        },
        {
          "target": "Drawer_06_Side_Right_Tile_cpp",
          "factor": 0.5
        },
        {
          "target": "Drawer_06_Side_Right_Tile_cpm",
          "factor": -0.5
        },
        {
          "target": "Drawer_06_Side_Right_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Drawer_06_Side_Right_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Drawer_06_Side_Right_Tile_cmp",
          "factor": 0.5
        },
        {
          "target": "Drawer_06_Side_Right_Tile_cmm",
          "factor": -0.5
        },
        {
          "target": "Drawer_06_Back",
          "factor": -0.5
        },
        {
          "target": "Drawer_06_Inner_Front",
          "factor": 0.5
        },
        {
          "target": "Drawer_06_Handle",
          "factor": 0.5
        }
      ]
    }
  ],
  "textureAxes": {},
  "materialSlots": {
    "hardware": {
      "label": "Цвет ручек",
      "targets": [
        "Hardware_Color"
      ],
      "defaultFinish": "metal-white-matte",
      "allowedFinishes": [
        "metal-black-matte",
        "metal-white-matte",
        "metal-anthracite"
      ]
    }
  }
} as const satisfies FurnitureDefinition

export const MATERIAL_TARGETS = {
  "carcass": [
    "Board_Top_pcp_X",
    "Board_Top_pcc_X",
    "Board_Top_pcm_X",
    "Board_Top_mcm_X",
    "Board_Top_mcc_X",
    "Board_Top_mcp_X",
    "Board_Top_mcm_Y",
    "Board_Top_ccm_Y",
    "Board_Top_pcm_Y",
    "Board_Top_mcc_Y",
    "Board_Top_ccc_Y",
    "Board_Top_pcc_Y",
    "Board_Top_mcp_Y",
    "Board_Top_ccp_Y",
    "Board_Top_pcp_Y",
    "Board_Top_mcp_Z",
    "Board_Top_ccp_Z",
    "Board_Top_pcp_Z",
    "Board_Top_pcm_Z",
    "Board_Top_ccm_Z",
    "Board_Top_mcm_Z",
    "Board_Side_cpp_X",
    "Board_Side_cpc_X",
    "Board_Side_cpm_X",
    "Board_Side_ccp_X",
    "Board_Side_ccc_X",
    "Board_Side_ccm_X",
    "Board_Side_cmp_X",
    "Board_Side_cmc_X",
    "Board_Side_cmm_X",
    "Board_Side_cpm_Y",
    "Board_Side_cpc_Y",
    "Board_Side_cpp_Y",
    "Board_Side_cmp_Y",
    "Board_Side_cmc_Y",
    "Board_Side_cmm_Y",
    "Board_Side_cpp_Z",
    "Board_Side_ccp_Z",
    "Board_Side_cmp_Z",
    "Board_Side_cpm_Z",
    "Board_Side_ccm_Z",
    "Board_Side_cmm_Z",
    "Board_Bottom_pcp_X",
    "Board_Bottom_pcc_X",
    "Board_Bottom_pcm_X",
    "Board_Bottom_mcm_X",
    "Board_Bottom_mcc_X",
    "Board_Bottom_mcp_X",
    "Board_Bottom_mcm_Y",
    "Board_Bottom_ccm_Y",
    "Board_Bottom_pcm_Y",
    "Board_Bottom_mcc_Y",
    "Board_Bottom_ccc_Y",
    "Board_Bottom_pcc_Y",
    "Board_Bottom_mcp_Y",
    "Board_Bottom_ccp_Y",
    "Board_Bottom_pcp_Y",
    "Board_Bottom_mcp_Z",
    "Board_Bottom_ccp_Z",
    "Board_Bottom_pcp_Z",
    "Board_Bottom_pcm_Z",
    "Board_Bottom_ccm_Z",
    "Board_Bottom_mcm_Z",
    "Board_Back_ppc_X",
    "Board_Back_pcc_X",
    "Board_Back_pmc_X",
    "Board_Back_mpc_X",
    "Board_Back_mcc_X",
    "Board_Back_mmc_X",
    "Board_Back_mpc_Y",
    "Board_Back_cpc_Y",
    "Board_Back_ppc_Y",
    "Board_Back_mmc_Y",
    "Board_Back_cmc_Y",
    "Board_Back_pmc_Y",
    "Board_Back_mpc_Z",
    "Board_Back_cpc_Z",
    "Board_Back_ppc_Z",
    "Board_Back_mcc_Z",
    "Board_Back_ccc_Z",
    "Board_Back_pcc_Z",
    "Board_Back_mmc_Z",
    "Board_Back_cmc_Z",
    "Board_Back_pmc_Z",
    "Board_Divider_cpp_X",
    "Board_Divider_cpc_X",
    "Board_Divider_cpm_X",
    "Board_Divider_ccp_X",
    "Board_Divider_ccc_X",
    "Board_Divider_ccm_X",
    "Board_Divider_cmp_X",
    "Board_Divider_cmc_X",
    "Board_Divider_cmm_X",
    "Board_Divider_cpm_Y",
    "Board_Divider_cpc_Y",
    "Board_Divider_cpp_Y",
    "Board_Divider_cmp_Y",
    "Board_Divider_cmc_Y",
    "Board_Divider_cmm_Y",
    "Board_Divider_cpp_Z",
    "Board_Divider_ccp_Z",
    "Board_Divider_cmp_Z",
    "Board_Divider_cpm_Z",
    "Board_Divider_ccm_Z",
    "Board_Divider_cmm_Z",
    "Board_DrawerBottom_pcp_X",
    "Board_DrawerBottom_pcc_X",
    "Board_DrawerBottom_pcm_X",
    "Board_DrawerBottom_mcm_X",
    "Board_DrawerBottom_mcc_X",
    "Board_DrawerBottom_mcp_X",
    "Board_DrawerBottom_mcm_Y",
    "Board_DrawerBottom_ccm_Y",
    "Board_DrawerBottom_pcm_Y",
    "Board_DrawerBottom_mcc_Y",
    "Board_DrawerBottom_ccc_Y",
    "Board_DrawerBottom_pcc_Y",
    "Board_DrawerBottom_mcp_Y",
    "Board_DrawerBottom_ccp_Y",
    "Board_DrawerBottom_pcp_Y",
    "Board_DrawerBottom_mcp_Z",
    "Board_DrawerBottom_ccp_Z",
    "Board_DrawerBottom_pcp_Z",
    "Board_DrawerBottom_pcm_Z",
    "Board_DrawerBottom_ccm_Z",
    "Board_DrawerBottom_mcm_Z",
    "Board_DrawerSide_cpp_X",
    "Board_DrawerSide_cpc_X",
    "Board_DrawerSide_cpm_X",
    "Board_DrawerSide_ccp_X",
    "Board_DrawerSide_ccc_X",
    "Board_DrawerSide_ccm_X",
    "Board_DrawerSide_cmp_X",
    "Board_DrawerSide_cmc_X",
    "Board_DrawerSide_cmm_X",
    "Board_DrawerSide_cpm_Y",
    "Board_DrawerSide_cpc_Y",
    "Board_DrawerSide_cpp_Y",
    "Board_DrawerSide_cmp_Y",
    "Board_DrawerSide_cmc_Y",
    "Board_DrawerSide_cmm_Y",
    "Board_DrawerSide_cpp_Z",
    "Board_DrawerSide_ccp_Z",
    "Board_DrawerSide_cmp_Z",
    "Board_DrawerSide_cpm_Z",
    "Board_DrawerSide_ccm_Z",
    "Board_DrawerSide_cmm_Z",
    "Board_DrawerWall_ppc_X",
    "Board_DrawerWall_pcc_X",
    "Board_DrawerWall_pmc_X",
    "Board_DrawerWall_mpc_X",
    "Board_DrawerWall_mcc_X",
    "Board_DrawerWall_mmc_X",
    "Board_DrawerWall_mpc_Y",
    "Board_DrawerWall_cpc_Y",
    "Board_DrawerWall_ppc_Y",
    "Board_DrawerWall_mmc_Y",
    "Board_DrawerWall_cmc_Y",
    "Board_DrawerWall_pmc_Y",
    "Board_DrawerWall_mpc_Z",
    "Board_DrawerWall_cpc_Z",
    "Board_DrawerWall_ppc_Z",
    "Board_DrawerWall_mcc_Z",
    "Board_DrawerWall_ccc_Z",
    "Board_DrawerWall_pcc_Z",
    "Board_DrawerWall_mmc_Z",
    "Board_DrawerWall_cmc_Z",
    "Board_DrawerWall_pmc_Z"
  ],
  "fronts": [
    "Front_Facade_plain_Drawer_ppc_X",
    "Front_Facade_plain_Drawer_pcc_X",
    "Front_Facade_plain_Drawer_pmc_X",
    "Front_Facade_plain_Drawer_mpc_X",
    "Front_Facade_plain_Drawer_mcc_X",
    "Front_Facade_plain_Drawer_mmc_X",
    "Front_Facade_plain_Drawer_mpc_Y",
    "Front_Facade_plain_Drawer_cpc_Y",
    "Front_Facade_plain_Drawer_ppc_Y",
    "Front_Facade_plain_Drawer_mmc_Y",
    "Front_Facade_plain_Drawer_cmc_Y",
    "Front_Facade_plain_Drawer_pmc_Y",
    "Front_Facade_plain_Drawer_mpc_Z",
    "Front_Facade_plain_Drawer_cpc_Z",
    "Front_Facade_plain_Drawer_ppc_Z",
    "Front_Facade_plain_Drawer_mcc_Z",
    "Front_Facade_plain_Drawer_ccc_Z",
    "Front_Facade_plain_Drawer_pcc_Z",
    "Front_Facade_plain_Drawer_mmc_Z",
    "Front_Facade_plain_Drawer_cmc_Z",
    "Front_Facade_plain_Drawer_pmc_Z"
  ],
  "hardware": [
    "Hardware_Color"
  ],
  "fixed": [
    "Mechanism_Steel"
  ]
} as const

export function createMaterialReviewDefinition(carcassFinish: string, frontsFinish: string, allowedFinishes: readonly string[], hardwareFinish = 'metal-black-matte'): FurnitureDefinition {
  for (const id of [carcassFinish, frontsFinish]) if (!allowedFinishes.includes(id)) throw new Error('Default finish must be allowed')
  const hardwareAllowed = ['metal-black-matte','metal-white-matte','metal-anthracite']
  if (!hardwareAllowed.includes(hardwareFinish)) throw new Error('Unsupported hardware finish')
  const slots: NonNullable<FurnitureDefinition['materialSlots']> = {
    carcass: { label:'Корпус и внутренние детали', targets:MATERIAL_TARGETS.carcass, defaultFinish:carcassFinish, allowedFinishes },
    fronts: { label:'Фасады', targets:MATERIAL_TARGETS.fronts, defaultFinish:frontsFinish, allowedFinishes },
    ...(MATERIAL_TARGETS.hardware.length ? {hardware:{label:'Ручки',targets:MATERIAL_TARGETS.hardware,defaultFinish:hardwareFinish,allowedFinishes:hardwareAllowed}} : {}),
  }
  return {...DRESSER_12_CONFIG, materialSlots:slots}
}
