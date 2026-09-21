import type { FurnitureDefinition } from '../../furniture/types'

// Model-only geometry review. Полные покрытия и affine UV подключаются централизованно.
export const DRESSER_13_CONFIG = {
  "id": "dresser-13-marvel-fluted",
  "label": "Комод «Марвэл»",
  "modelUrl": "/models/dresser-13-marvel-fluted.glb",
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
      "base": 0.9,
      "min": 0.75,
      "max": 1.1,
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
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Top_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
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
      "baseLength": 0.4336,
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
      "baseLength": 0.4136,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Left_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.8726,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Left_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.8726,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Left_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4136,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Left_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.8726,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Left_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4136,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Right_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4136,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Right_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.8726,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Right_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.8726,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Right_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4136,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Right_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.8726,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Right_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4136,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Bottom_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4096,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Bottom_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4096,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Bottom_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5626,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Bottom_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5626,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Bottom_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4096,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Bottom_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5626,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Back_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.8726,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Back_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.8726,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Back_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5626,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Back_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5626,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Back_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5626,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Back_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.8726,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_1_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4096,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_1_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.8566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_1_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.8566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_1_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4096,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_1_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.8566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_1_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4096,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_2_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4096,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_2_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.8566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_2_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.8566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_2_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4096,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_2_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.8566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_2_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4096,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Core_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.8506,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Core_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.8506,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Core_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.3766,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Core_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.3766,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Core_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.3766,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Core_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.8506,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Flute_01",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Flute_02",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Flute_03",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Flute_04",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Flute_05",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Flute_06",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Flute_07",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Flute_08",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Flute_09",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Flute_10",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Flute_11",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Flute_12",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Flute_13",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Flute_14",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Flute_15",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Flute_16",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Flute_17",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Flute_18",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Flute_19",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Flute_20",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Flute_21",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Flute_22",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Flute_23",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Flute_24",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Flute_25",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Front_Flute_26",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Left_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3896,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Left_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3896,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Left_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.3716,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Left_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.3716,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Left_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3896,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Left_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.3716,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Front_Core_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1981,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Front_Core_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1981,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Front_Core_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7946,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Front_Core_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7946,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Front_Core_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7946,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Front_Core_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1981,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Bottom_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Bottom_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Bottom_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7566,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Bottom_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7566,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Bottom_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Bottom_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7566,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Left_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Left_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Left_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Left_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Left_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Left_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Slide_Fixed_Left",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.374,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Slide_Moving_Left",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.364,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Right_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Right_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Right_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Right_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Right_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Right_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Slide_Fixed_Right",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.374,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Slide_Moving_Right",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.364,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Back_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Back_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Back_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7246,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Back_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7246,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Back_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7246,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Back_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Inner_Front_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Inner_Front_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Inner_Front_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7246,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Inner_Front_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7246,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Inner_Front_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7246,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Inner_Front_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Grip_Recess_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7816,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Grip_Recess_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7816,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Grip_Recess_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7816,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Front_Core_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1981,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Front_Core_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1981,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Front_Core_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7946,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Front_Core_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7946,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Front_Core_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7946,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Front_Core_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1981,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Bottom_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Bottom_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Bottom_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7566,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Bottom_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7566,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Bottom_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Bottom_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7566,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Left_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Left_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Left_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Left_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Left_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Left_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Slide_Fixed_Left",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.374,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Slide_Moving_Left",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.364,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Right_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Right_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Right_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Right_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Right_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Right_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Slide_Fixed_Right",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.374,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Slide_Moving_Right",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.364,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Back_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Back_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Back_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7246,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Back_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7246,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Back_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7246,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Back_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Inner_Front_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Inner_Front_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Inner_Front_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7246,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Inner_Front_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7246,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Inner_Front_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7246,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Inner_Front_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Grip_Recess_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7816,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Grip_Recess_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7816,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Grip_Recess_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7816,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Front_Core_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1981,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Front_Core_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1981,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Front_Core_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7946,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Front_Core_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7946,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Front_Core_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7946,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Front_Core_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1981,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Bottom_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Bottom_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Bottom_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7566,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Bottom_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7566,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Bottom_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Bottom_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7566,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Left_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Left_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Left_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Left_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Left_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Left_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Slide_Fixed_Left",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.374,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Slide_Moving_Left",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.364,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Right_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Right_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Right_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Right_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Right_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Right_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Slide_Fixed_Right",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.374,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Slide_Moving_Right",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.364,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Back_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Back_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Back_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7246,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Back_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7246,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Back_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7246,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Back_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Inner_Front_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Inner_Front_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Inner_Front_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7246,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Inner_Front_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7246,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Inner_Front_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7246,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Inner_Front_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Grip_Recess_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7816,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Grip_Recess_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7816,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Grip_Recess_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7816,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Front_Core_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1981,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Front_Core_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1981,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Front_Core_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7946,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Front_Core_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7946,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Front_Core_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7946,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Front_Core_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1981,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Bottom_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Bottom_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Bottom_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7566,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Bottom_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7566,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Bottom_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Bottom_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7566,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Side_Left_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Side_Left_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Side_Left_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Side_Left_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Side_Left_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Side_Left_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Slide_Fixed_Left",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.374,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Slide_Moving_Left",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.364,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Side_Right_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Side_Right_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Side_Right_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Side_Right_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Side_Right_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Side_Right_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3876,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Slide_Fixed_Right",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.374,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Slide_Moving_Right",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.364,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Back_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Back_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Back_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7246,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Back_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7246,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Back_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7246,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Back_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Inner_Front_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Inner_Front_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Inner_Front_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7246,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Inner_Front_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7246,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Inner_Front_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7246,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_04_Inner_Front_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.1501,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Core_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.8506,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Core_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.8506,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Core_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.3766,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Core_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.3766,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Core_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.3766,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Core_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.8506,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Flute_01",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Flute_02",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Flute_03",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Flute_04",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Flute_05",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Flute_06",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Flute_07",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Flute_08",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Flute_09",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Flute_10",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Flute_11",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Flute_12",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Flute_13",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Flute_14",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Flute_15",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Flute_16",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Flute_17",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Flute_18",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Flute_19",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Flute_20",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Flute_21",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Flute_22",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Flute_23",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Flute_24",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Flute_25",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Front_Flute_26",
      "dimension": "height",
      "axis": "y",
      "baseLength": 0.848,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Right_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3896,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Right_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3896,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Right_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.3716,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Right_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.3716,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Right_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3896,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Right_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.3716,
      "factor": 0.25
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
          "target": "Panel_Divider_2",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_2_Tile_cpp",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_2_Tile_cpc",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_2_Tile_cpm",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_2_Tile_cmp",
          "factor": -0.5
        },
        {
          "target": "Panel_Divider_2_Tile_cmc",
          "factor": -0.5
        },
        {
          "target": "Panel_Divider_2_Tile_cmm",
          "factor": -0.5
        },
        {
          "target": "Door_Left_Front",
          "factor": 0.5
        },
        {
          "target": "Door_Left_Front_Core_Tile_ppc",
          "factor": 0.5
        },
        {
          "target": "Door_Left_Front_Core_Tile_pmc",
          "factor": -0.5
        },
        {
          "target": "Door_Left_Front_Core_Tile_mpc",
          "factor": 0.5
        },
        {
          "target": "Door_Left_Front_Core_Tile_mmc",
          "factor": -0.5
        },
        {
          "target": "Door_Left_Front_Core_Tile_cpc",
          "factor": 0.5
        },
        {
          "target": "Door_Left_Front_Core_Tile_cmc",
          "factor": -0.5
        },
        {
          "target": "Shelf_Left",
          "factor": 0.5
        },
        {
          "target": "Hinge_Left_2_Cup",
          "factor": 1
        },
        {
          "target": "Hinge_Left_2_Plate",
          "factor": 1
        },
        {
          "target": "Handle_Door_Left",
          "factor": 1
        },
        {
          "target": "Drawer_01_Front",
          "factor": 0.125
        },
        {
          "target": "Drawer_01_Front_Core_Tile_ppc",
          "factor": 0.125
        },
        {
          "target": "Drawer_01_Front_Core_Tile_pmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_01_Front_Core_Tile_mpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_01_Front_Core_Tile_mmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_01_Front_Core_Tile_cpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_01_Front_Core_Tile_cmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_01_Side_Left",
          "factor": 0.125
        },
        {
          "target": "Drawer_01_Side_Left_Tile_cpp",
          "factor": 0.125
        },
        {
          "target": "Drawer_01_Side_Left_Tile_cpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_01_Side_Left_Tile_cpm",
          "factor": 0.125
        },
        {
          "target": "Drawer_01_Side_Left_Tile_cmp",
          "factor": -0.125
        },
        {
          "target": "Drawer_01_Side_Left_Tile_cmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_01_Side_Left_Tile_cmm",
          "factor": -0.125
        },
        {
          "target": "Drawer_01_Side_Right",
          "factor": 0.125
        },
        {
          "target": "Drawer_01_Side_Right_Tile_cpp",
          "factor": 0.125
        },
        {
          "target": "Drawer_01_Side_Right_Tile_cpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_01_Side_Right_Tile_cpm",
          "factor": 0.125
        },
        {
          "target": "Drawer_01_Side_Right_Tile_cmp",
          "factor": -0.125
        },
        {
          "target": "Drawer_01_Side_Right_Tile_cmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_01_Side_Right_Tile_cmm",
          "factor": -0.125
        },
        {
          "target": "Drawer_01_Back",
          "factor": 0.125
        },
        {
          "target": "Drawer_01_Back_Tile_ppc",
          "factor": 0.125
        },
        {
          "target": "Drawer_01_Back_Tile_pmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_01_Back_Tile_mpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_01_Back_Tile_mmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_01_Back_Tile_cpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_01_Back_Tile_cmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_01_Inner_Front",
          "factor": 0.125
        },
        {
          "target": "Drawer_01_Inner_Front_Tile_ppc",
          "factor": 0.125
        },
        {
          "target": "Drawer_01_Inner_Front_Tile_pmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_01_Inner_Front_Tile_mpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_01_Inner_Front_Tile_mmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_01_Inner_Front_Tile_cpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_01_Inner_Front_Tile_cmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_01_Grip_Recess",
          "factor": 0.25
        },
        {
          "target": "Drawer_02_Assembly",
          "factor": 0.25
        },
        {
          "target": "Drawer_02_Front",
          "factor": 0.125
        },
        {
          "target": "Drawer_02_Front_Core_Tile_ppc",
          "factor": 0.125
        },
        {
          "target": "Drawer_02_Front_Core_Tile_pmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_02_Front_Core_Tile_mpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_02_Front_Core_Tile_mmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_02_Front_Core_Tile_cpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_02_Front_Core_Tile_cmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_02_Side_Left",
          "factor": 0.125
        },
        {
          "target": "Drawer_02_Side_Left_Tile_cpp",
          "factor": 0.125
        },
        {
          "target": "Drawer_02_Side_Left_Tile_cpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_02_Side_Left_Tile_cpm",
          "factor": 0.125
        },
        {
          "target": "Drawer_02_Side_Left_Tile_cmp",
          "factor": -0.125
        },
        {
          "target": "Drawer_02_Side_Left_Tile_cmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_02_Side_Left_Tile_cmm",
          "factor": -0.125
        },
        {
          "target": "Drawer_02_Slide_Fixed_Left",
          "factor": 0.25
        },
        {
          "target": "Drawer_02_Side_Right",
          "factor": 0.125
        },
        {
          "target": "Drawer_02_Side_Right_Tile_cpp",
          "factor": 0.125
        },
        {
          "target": "Drawer_02_Side_Right_Tile_cpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_02_Side_Right_Tile_cpm",
          "factor": 0.125
        },
        {
          "target": "Drawer_02_Side_Right_Tile_cmp",
          "factor": -0.125
        },
        {
          "target": "Drawer_02_Side_Right_Tile_cmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_02_Side_Right_Tile_cmm",
          "factor": -0.125
        },
        {
          "target": "Drawer_02_Slide_Fixed_Right",
          "factor": 0.25
        },
        {
          "target": "Drawer_02_Back",
          "factor": 0.125
        },
        {
          "target": "Drawer_02_Back_Tile_ppc",
          "factor": 0.125
        },
        {
          "target": "Drawer_02_Back_Tile_pmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_02_Back_Tile_mpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_02_Back_Tile_mmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_02_Back_Tile_cpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_02_Back_Tile_cmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_02_Inner_Front",
          "factor": 0.125
        },
        {
          "target": "Drawer_02_Inner_Front_Tile_ppc",
          "factor": 0.125
        },
        {
          "target": "Drawer_02_Inner_Front_Tile_pmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_02_Inner_Front_Tile_mpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_02_Inner_Front_Tile_mmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_02_Inner_Front_Tile_cpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_02_Inner_Front_Tile_cmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_02_Grip_Recess",
          "factor": 0.5
        },
        {
          "target": "Drawer_03_Assembly",
          "factor": 0.5
        },
        {
          "target": "Drawer_03_Front",
          "factor": 0.125
        },
        {
          "target": "Drawer_03_Front_Core_Tile_ppc",
          "factor": 0.125
        },
        {
          "target": "Drawer_03_Front_Core_Tile_pmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_03_Front_Core_Tile_mpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_03_Front_Core_Tile_mmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_03_Front_Core_Tile_cpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_03_Front_Core_Tile_cmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_03_Side_Left",
          "factor": 0.125
        },
        {
          "target": "Drawer_03_Side_Left_Tile_cpp",
          "factor": 0.125
        },
        {
          "target": "Drawer_03_Side_Left_Tile_cpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_03_Side_Left_Tile_cpm",
          "factor": 0.125
        },
        {
          "target": "Drawer_03_Side_Left_Tile_cmp",
          "factor": -0.125
        },
        {
          "target": "Drawer_03_Side_Left_Tile_cmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_03_Side_Left_Tile_cmm",
          "factor": -0.125
        },
        {
          "target": "Drawer_03_Slide_Fixed_Left",
          "factor": 0.5
        },
        {
          "target": "Drawer_03_Side_Right",
          "factor": 0.125
        },
        {
          "target": "Drawer_03_Side_Right_Tile_cpp",
          "factor": 0.125
        },
        {
          "target": "Drawer_03_Side_Right_Tile_cpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_03_Side_Right_Tile_cpm",
          "factor": 0.125
        },
        {
          "target": "Drawer_03_Side_Right_Tile_cmp",
          "factor": -0.125
        },
        {
          "target": "Drawer_03_Side_Right_Tile_cmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_03_Side_Right_Tile_cmm",
          "factor": -0.125
        },
        {
          "target": "Drawer_03_Slide_Fixed_Right",
          "factor": 0.5
        },
        {
          "target": "Drawer_03_Back",
          "factor": 0.125
        },
        {
          "target": "Drawer_03_Back_Tile_ppc",
          "factor": 0.125
        },
        {
          "target": "Drawer_03_Back_Tile_pmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_03_Back_Tile_mpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_03_Back_Tile_mmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_03_Back_Tile_cpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_03_Back_Tile_cmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_03_Inner_Front",
          "factor": 0.125
        },
        {
          "target": "Drawer_03_Inner_Front_Tile_ppc",
          "factor": 0.125
        },
        {
          "target": "Drawer_03_Inner_Front_Tile_pmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_03_Inner_Front_Tile_mpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_03_Inner_Front_Tile_mmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_03_Inner_Front_Tile_cpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_03_Inner_Front_Tile_cmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_03_Grip_Recess",
          "factor": 0.75
        },
        {
          "target": "Drawer_04_Assembly",
          "factor": 0.75
        },
        {
          "target": "Drawer_04_Front",
          "factor": 0.125
        },
        {
          "target": "Drawer_04_Front_Core_Tile_ppc",
          "factor": 0.125
        },
        {
          "target": "Drawer_04_Front_Core_Tile_pmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_04_Front_Core_Tile_mpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_04_Front_Core_Tile_mmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_04_Front_Core_Tile_cpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_04_Front_Core_Tile_cmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_04_Side_Left",
          "factor": 0.125
        },
        {
          "target": "Drawer_04_Side_Left_Tile_cpp",
          "factor": 0.125
        },
        {
          "target": "Drawer_04_Side_Left_Tile_cpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_04_Side_Left_Tile_cpm",
          "factor": 0.125
        },
        {
          "target": "Drawer_04_Side_Left_Tile_cmp",
          "factor": -0.125
        },
        {
          "target": "Drawer_04_Side_Left_Tile_cmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_04_Side_Left_Tile_cmm",
          "factor": -0.125
        },
        {
          "target": "Drawer_04_Slide_Fixed_Left",
          "factor": 0.75
        },
        {
          "target": "Drawer_04_Side_Right",
          "factor": 0.125
        },
        {
          "target": "Drawer_04_Side_Right_Tile_cpp",
          "factor": 0.125
        },
        {
          "target": "Drawer_04_Side_Right_Tile_cpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_04_Side_Right_Tile_cpm",
          "factor": 0.125
        },
        {
          "target": "Drawer_04_Side_Right_Tile_cmp",
          "factor": -0.125
        },
        {
          "target": "Drawer_04_Side_Right_Tile_cmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_04_Side_Right_Tile_cmm",
          "factor": -0.125
        },
        {
          "target": "Drawer_04_Slide_Fixed_Right",
          "factor": 0.75
        },
        {
          "target": "Drawer_04_Back",
          "factor": 0.125
        },
        {
          "target": "Drawer_04_Back_Tile_ppc",
          "factor": 0.125
        },
        {
          "target": "Drawer_04_Back_Tile_pmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_04_Back_Tile_mpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_04_Back_Tile_mmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_04_Back_Tile_cpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_04_Back_Tile_cmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_04_Inner_Front",
          "factor": 0.125
        },
        {
          "target": "Drawer_04_Inner_Front_Tile_ppc",
          "factor": 0.125
        },
        {
          "target": "Drawer_04_Inner_Front_Tile_pmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_04_Inner_Front_Tile_mpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_04_Inner_Front_Tile_mmc",
          "factor": -0.125
        },
        {
          "target": "Drawer_04_Inner_Front_Tile_cpc",
          "factor": 0.125
        },
        {
          "target": "Drawer_04_Inner_Front_Tile_cmc",
          "factor": -0.125
        },
        {
          "target": "Door_Right_Front",
          "factor": 0.5
        },
        {
          "target": "Door_Right_Front_Core_Tile_ppc",
          "factor": 0.5
        },
        {
          "target": "Door_Right_Front_Core_Tile_pmc",
          "factor": -0.5
        },
        {
          "target": "Door_Right_Front_Core_Tile_mpc",
          "factor": 0.5
        },
        {
          "target": "Door_Right_Front_Core_Tile_mmc",
          "factor": -0.5
        },
        {
          "target": "Door_Right_Front_Core_Tile_cpc",
          "factor": 0.5
        },
        {
          "target": "Door_Right_Front_Core_Tile_cmc",
          "factor": -0.5
        },
        {
          "target": "Shelf_Right",
          "factor": 0.5
        },
        {
          "target": "Hinge_Right_2_Cup",
          "factor": 1
        },
        {
          "target": "Hinge_Right_2_Plate",
          "factor": 1
        },
        {
          "target": "Handle_Door_Right",
          "factor": 1
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
          "target": "Panel_Divider_1",
          "factor": -0.25
        },
        {
          "target": "Panel_Divider_2",
          "factor": 0.25
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
          "target": "Door_Left_Hinge",
          "factor": -0.5
        },
        {
          "target": "Door_Left_Front",
          "factor": 0.125
        },
        {
          "target": "Door_Left_Front_Core_Tile_ppc",
          "factor": 0.125
        },
        {
          "target": "Door_Left_Front_Core_Tile_pcc",
          "factor": 0.125
        },
        {
          "target": "Door_Left_Front_Core_Tile_pmc",
          "factor": 0.125
        },
        {
          "target": "Door_Left_Front_Core_Tile_mpc",
          "factor": -0.125
        },
        {
          "target": "Door_Left_Front_Core_Tile_mcc",
          "factor": -0.125
        },
        {
          "target": "Door_Left_Front_Core_Tile_mmc",
          "factor": -0.125
        },
        {
          "target": "Door_Left_Front_Flute_01",
          "factor": -0.115740740741
        },
        {
          "target": "Door_Left_Front_Flute_02",
          "factor": -0.106481481481
        },
        {
          "target": "Door_Left_Front_Flute_03",
          "factor": -0.097222222222
        },
        {
          "target": "Door_Left_Front_Flute_04",
          "factor": -0.087962962963
        },
        {
          "target": "Door_Left_Front_Flute_05",
          "factor": -0.078703703704
        },
        {
          "target": "Door_Left_Front_Flute_06",
          "factor": -0.069444444444
        },
        {
          "target": "Door_Left_Front_Flute_07",
          "factor": -0.060185185185
        },
        {
          "target": "Door_Left_Front_Flute_08",
          "factor": -0.050925925926
        },
        {
          "target": "Door_Left_Front_Flute_09",
          "factor": -0.041666666667
        },
        {
          "target": "Door_Left_Front_Flute_10",
          "factor": -0.032407407407
        },
        {
          "target": "Door_Left_Front_Flute_11",
          "factor": -0.023148148148
        },
        {
          "target": "Door_Left_Front_Flute_12",
          "factor": -0.013888888889
        },
        {
          "target": "Door_Left_Front_Flute_13",
          "factor": -0.00462962963
        },
        {
          "target": "Door_Left_Front_Flute_14",
          "factor": 0.00462962963
        },
        {
          "target": "Door_Left_Front_Flute_15",
          "factor": 0.013888888889
        },
        {
          "target": "Door_Left_Front_Flute_16",
          "factor": 0.023148148148
        },
        {
          "target": "Door_Left_Front_Flute_17",
          "factor": 0.032407407407
        },
        {
          "target": "Door_Left_Front_Flute_18",
          "factor": 0.041666666667
        },
        {
          "target": "Door_Left_Front_Flute_19",
          "factor": 0.050925925926
        },
        {
          "target": "Door_Left_Front_Flute_20",
          "factor": 0.060185185185
        },
        {
          "target": "Door_Left_Front_Flute_21",
          "factor": 0.069444444444
        },
        {
          "target": "Door_Left_Front_Flute_22",
          "factor": 0.078703703704
        },
        {
          "target": "Door_Left_Front_Flute_23",
          "factor": 0.087962962963
        },
        {
          "target": "Door_Left_Front_Flute_24",
          "factor": 0.097222222222
        },
        {
          "target": "Door_Left_Front_Flute_25",
          "factor": 0.106481481481
        },
        {
          "target": "Door_Left_Front_Flute_26",
          "factor": 0.115740740741
        },
        {
          "target": "Shelf_Left",
          "factor": -0.375
        },
        {
          "target": "Shelf_Left_Tile_pcp",
          "factor": 0.125
        },
        {
          "target": "Shelf_Left_Tile_pcc",
          "factor": 0.125
        },
        {
          "target": "Shelf_Left_Tile_pcm",
          "factor": 0.125
        },
        {
          "target": "Shelf_Left_Tile_mcm",
          "factor": -0.125
        },
        {
          "target": "Shelf_Left_Tile_mcc",
          "factor": -0.125
        },
        {
          "target": "Shelf_Left_Tile_mcp",
          "factor": -0.125
        },
        {
          "target": "Hinge_Left_1_Plate",
          "factor": -0.5
        },
        {
          "target": "Hinge_Left_2_Plate",
          "factor": -0.5
        },
        {
          "target": "Handle_Door_Left",
          "factor": 0.125
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
          "factor": -0.25
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
          "target": "Drawer_01_Slide_Fixed_Right",
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
          "target": "Drawer_01_Grip_Recess_Tile_ppc",
          "factor": 0.25
        },
        {
          "target": "Drawer_01_Grip_Recess_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_01_Grip_Recess_Tile_pmc",
          "factor": 0.25
        },
        {
          "target": "Drawer_01_Grip_Recess_Tile_mpc",
          "factor": -0.25
        },
        {
          "target": "Drawer_01_Grip_Recess_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_01_Grip_Recess_Tile_mmc",
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
          "factor": -0.25
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
          "target": "Drawer_02_Slide_Fixed_Right",
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
          "target": "Drawer_02_Grip_Recess_Tile_ppc",
          "factor": 0.25
        },
        {
          "target": "Drawer_02_Grip_Recess_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_02_Grip_Recess_Tile_pmc",
          "factor": 0.25
        },
        {
          "target": "Drawer_02_Grip_Recess_Tile_mpc",
          "factor": -0.25
        },
        {
          "target": "Drawer_02_Grip_Recess_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_02_Grip_Recess_Tile_mmc",
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
          "factor": -0.25
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
          "target": "Drawer_03_Slide_Fixed_Right",
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
          "target": "Drawer_03_Grip_Recess_Tile_ppc",
          "factor": 0.25
        },
        {
          "target": "Drawer_03_Grip_Recess_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_03_Grip_Recess_Tile_pmc",
          "factor": 0.25
        },
        {
          "target": "Drawer_03_Grip_Recess_Tile_mpc",
          "factor": -0.25
        },
        {
          "target": "Drawer_03_Grip_Recess_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_03_Grip_Recess_Tile_mmc",
          "factor": -0.25
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
          "target": "Drawer_04_Slide_Fixed_Left",
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
          "factor": 0.25
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
          "target": "Door_Right_Hinge",
          "factor": 0.5
        },
        {
          "target": "Door_Right_Front",
          "factor": -0.125
        },
        {
          "target": "Door_Right_Front_Core_Tile_ppc",
          "factor": 0.125
        },
        {
          "target": "Door_Right_Front_Core_Tile_pcc",
          "factor": 0.125
        },
        {
          "target": "Door_Right_Front_Core_Tile_pmc",
          "factor": 0.125
        },
        {
          "target": "Door_Right_Front_Core_Tile_mpc",
          "factor": -0.125
        },
        {
          "target": "Door_Right_Front_Core_Tile_mcc",
          "factor": -0.125
        },
        {
          "target": "Door_Right_Front_Core_Tile_mmc",
          "factor": -0.125
        },
        {
          "target": "Door_Right_Front_Flute_01",
          "factor": -0.115740740741
        },
        {
          "target": "Door_Right_Front_Flute_02",
          "factor": -0.106481481481
        },
        {
          "target": "Door_Right_Front_Flute_03",
          "factor": -0.097222222222
        },
        {
          "target": "Door_Right_Front_Flute_04",
          "factor": -0.087962962963
        },
        {
          "target": "Door_Right_Front_Flute_05",
          "factor": -0.078703703704
        },
        {
          "target": "Door_Right_Front_Flute_06",
          "factor": -0.069444444444
        },
        {
          "target": "Door_Right_Front_Flute_07",
          "factor": -0.060185185185
        },
        {
          "target": "Door_Right_Front_Flute_08",
          "factor": -0.050925925926
        },
        {
          "target": "Door_Right_Front_Flute_09",
          "factor": -0.041666666667
        },
        {
          "target": "Door_Right_Front_Flute_10",
          "factor": -0.032407407407
        },
        {
          "target": "Door_Right_Front_Flute_11",
          "factor": -0.023148148148
        },
        {
          "target": "Door_Right_Front_Flute_12",
          "factor": -0.013888888889
        },
        {
          "target": "Door_Right_Front_Flute_13",
          "factor": -0.00462962963
        },
        {
          "target": "Door_Right_Front_Flute_14",
          "factor": 0.00462962963
        },
        {
          "target": "Door_Right_Front_Flute_15",
          "factor": 0.013888888889
        },
        {
          "target": "Door_Right_Front_Flute_16",
          "factor": 0.023148148148
        },
        {
          "target": "Door_Right_Front_Flute_17",
          "factor": 0.032407407407
        },
        {
          "target": "Door_Right_Front_Flute_18",
          "factor": 0.041666666667
        },
        {
          "target": "Door_Right_Front_Flute_19",
          "factor": 0.050925925926
        },
        {
          "target": "Door_Right_Front_Flute_20",
          "factor": 0.060185185185
        },
        {
          "target": "Door_Right_Front_Flute_21",
          "factor": 0.069444444444
        },
        {
          "target": "Door_Right_Front_Flute_22",
          "factor": 0.078703703704
        },
        {
          "target": "Door_Right_Front_Flute_23",
          "factor": 0.087962962963
        },
        {
          "target": "Door_Right_Front_Flute_24",
          "factor": 0.097222222222
        },
        {
          "target": "Door_Right_Front_Flute_25",
          "factor": 0.106481481481
        },
        {
          "target": "Door_Right_Front_Flute_26",
          "factor": 0.115740740741
        },
        {
          "target": "Shelf_Right",
          "factor": 0.375
        },
        {
          "target": "Shelf_Right_Tile_pcp",
          "factor": 0.125
        },
        {
          "target": "Shelf_Right_Tile_pcc",
          "factor": 0.125
        },
        {
          "target": "Shelf_Right_Tile_pcm",
          "factor": 0.125
        },
        {
          "target": "Shelf_Right_Tile_mcm",
          "factor": -0.125
        },
        {
          "target": "Shelf_Right_Tile_mcc",
          "factor": -0.125
        },
        {
          "target": "Shelf_Right_Tile_mcp",
          "factor": -0.125
        },
        {
          "target": "Hinge_Right_1_Plate",
          "factor": 0.5
        },
        {
          "target": "Hinge_Right_2_Plate",
          "factor": 0.5
        },
        {
          "target": "Handle_Door_Right",
          "factor": -0.125
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
          "target": "Panel_Divider_2_Tile_cpp",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_2_Tile_cpm",
          "factor": -0.5
        },
        {
          "target": "Panel_Divider_2_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_2_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Panel_Divider_2_Tile_cmp",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_2_Tile_cmm",
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
          "target": "Door_Left_Hinge",
          "factor": 0.5
        },
        {
          "target": "Shelf_Left_Tile_pcp",
          "factor": 0.5
        },
        {
          "target": "Shelf_Left_Tile_pcm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Left_Tile_mcm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Left_Tile_mcp",
          "factor": 0.5
        },
        {
          "target": "Shelf_Left_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Left_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Hinge_Left_1_Plate",
          "factor": 0.5
        },
        {
          "target": "Hinge_Left_2_Plate",
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
          "target": "Drawer_01_Grip_Recess",
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
          "target": "Drawer_02_Grip_Recess",
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
          "target": "Drawer_03_Grip_Recess",
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
          "target": "Door_Right_Hinge",
          "factor": 0.5
        },
        {
          "target": "Shelf_Right_Tile_pcp",
          "factor": 0.5
        },
        {
          "target": "Shelf_Right_Tile_pcm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Right_Tile_mcm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Right_Tile_mcp",
          "factor": 0.5
        },
        {
          "target": "Shelf_Right_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Right_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Hinge_Right_1_Plate",
          "factor": 0.5
        },
        {
          "target": "Hinge_Right_2_Plate",
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
      "defaultFinish": "metal-black-matte",
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
    "Board_Shelf_pcp_X",
    "Board_Shelf_pcc_X",
    "Board_Shelf_pcm_X",
    "Board_Shelf_mcm_X",
    "Board_Shelf_mcc_X",
    "Board_Shelf_mcp_X",
    "Board_Shelf_mcm_Y",
    "Board_Shelf_ccm_Y",
    "Board_Shelf_pcm_Y",
    "Board_Shelf_mcc_Y",
    "Board_Shelf_ccc_Y",
    "Board_Shelf_pcc_Y",
    "Board_Shelf_mcp_Y",
    "Board_Shelf_ccp_Y",
    "Board_Shelf_pcp_Y",
    "Board_Shelf_mcp_Z",
    "Board_Shelf_ccp_Z",
    "Board_Shelf_pcp_Z",
    "Board_Shelf_pcm_Z",
    "Board_Shelf_ccm_Z",
    "Board_Shelf_mcm_Z",
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
    "Board_DrawerWall_pmc_Z",
    "Board_GripRecess_ppc_X",
    "Board_GripRecess_pcc_X",
    "Board_GripRecess_pmc_X",
    "Board_GripRecess_mpc_X",
    "Board_GripRecess_mcc_X",
    "Board_GripRecess_mmc_X",
    "Board_GripRecess_mpc_Y",
    "Board_GripRecess_cpc_Y",
    "Board_GripRecess_ppc_Y",
    "Board_GripRecess_mmc_Y",
    "Board_GripRecess_cmc_Y",
    "Board_GripRecess_pmc_Y",
    "Board_GripRecess_mpc_Z",
    "Board_GripRecess_cpc_Z",
    "Board_GripRecess_ppc_Z",
    "Board_GripRecess_mcc_Z",
    "Board_GripRecess_ccc_Z",
    "Board_GripRecess_pcc_Z",
    "Board_GripRecess_mmc_Z",
    "Board_GripRecess_cmc_Z",
    "Board_GripRecess_pmc_Z"
  ],
  "fronts": [
    "Front_Facade_fluted_Door_ppc_X",
    "Front_Facade_fluted_Door_pcc_X",
    "Front_Facade_fluted_Door_pmc_X",
    "Front_Facade_fluted_Door_mpc_X",
    "Front_Facade_fluted_Door_mcc_X",
    "Front_Facade_fluted_Door_mmc_X",
    "Front_Facade_fluted_Door_mpc_Y",
    "Front_Facade_fluted_Door_cpc_Y",
    "Front_Facade_fluted_Door_ppc_Y",
    "Front_Facade_fluted_Door_mmc_Y",
    "Front_Facade_fluted_Door_cmc_Y",
    "Front_Facade_fluted_Door_pmc_Y",
    "Front_Facade_fluted_Door_mpc_Z",
    "Front_Facade_fluted_Door_cpc_Z",
    "Front_Facade_fluted_Door_ppc_Z",
    "Front_Facade_fluted_Door_mcc_Z",
    "Front_Facade_fluted_Door_ccc_Z",
    "Front_Facade_fluted_Door_pcc_Z",
    "Front_Facade_fluted_Door_mmc_Z",
    "Front_Facade_fluted_Door_cmc_Z",
    "Front_Facade_fluted_Door_pmc_Z",
    "Front_Flute_01",
    "Front_Flute_01_Caps",
    "Front_Flute_02",
    "Front_Flute_02_Caps",
    "Front_Flute_03",
    "Front_Flute_03_Caps",
    "Front_Flute_04",
    "Front_Flute_04_Caps",
    "Front_Flute_05",
    "Front_Flute_05_Caps",
    "Front_Flute_06",
    "Front_Flute_06_Caps",
    "Front_Flute_07",
    "Front_Flute_07_Caps",
    "Front_Flute_08",
    "Front_Flute_08_Caps",
    "Front_Flute_09",
    "Front_Flute_09_Caps",
    "Front_Flute_10",
    "Front_Flute_10_Caps",
    "Front_Flute_11",
    "Front_Flute_11_Caps",
    "Front_Flute_12",
    "Front_Flute_12_Caps",
    "Front_Flute_13",
    "Front_Flute_13_Caps",
    "Front_Flute_14",
    "Front_Flute_14_Caps",
    "Front_Flute_15",
    "Front_Flute_15_Caps",
    "Front_Flute_16",
    "Front_Flute_16_Caps",
    "Front_Flute_17",
    "Front_Flute_17_Caps",
    "Front_Flute_18",
    "Front_Flute_18_Caps",
    "Front_Flute_19",
    "Front_Flute_19_Caps",
    "Front_Flute_20",
    "Front_Flute_20_Caps",
    "Front_Flute_21",
    "Front_Flute_21_Caps",
    "Front_Flute_22",
    "Front_Flute_22_Caps",
    "Front_Flute_23",
    "Front_Flute_23_Caps",
    "Front_Flute_24",
    "Front_Flute_24_Caps",
    "Front_Flute_25",
    "Front_Flute_25_Caps",
    "Front_Flute_26",
    "Front_Flute_26_Caps",
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
    "Mechanism_Steel",
    "Foot_Plastic"
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
  return {...DRESSER_13_CONFIG, materialSlots:slots}
}
