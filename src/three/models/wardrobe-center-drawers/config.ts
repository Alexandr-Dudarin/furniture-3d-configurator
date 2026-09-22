import type { FurnitureDefinition } from '../../furniture/types'

// Автоматически создано build_model.mjs. Размеры проверяются текущим generic controller.
// Серые исходные материалы остаются в GLB: board finish IDs ещё не зарегистрированы.
// Точные UV-привязки находятся в model-contract.json и требуют общего расширения.
export const WARDROBE_07_CONFIG = {
  "id": "wardrobe-07-center-drawers",
  "label": "Шкаф с центральными ящиками",
  "modelUrl": "/models/wardrobe-07-center-drawers.glb",
  "dimensions": {
    "width": {
      "label": "Ширина",
      "base": 1.601,
      "min": 1.4,
      "max": 2,
      "step": 0.001
    },
    "height": {
      "label": "Высота",
      "base": 2.052,
      "min": 1.9,
      "max": 2.4,
      "step": 0.001
    },
    "depth": {
      "label": "Глубина",
      "base": 0.48,
      "min": 0.4,
      "max": 0.65,
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
      "target": "Panel_Back_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 2.0506,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Back_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 2.0506,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Back_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5996,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Back_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5996,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Back_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5996,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Back_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 2.0506,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Top_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Top_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Top_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5996,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Top_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5996,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Top_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Top_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5996,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Left_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Left_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 2.0346,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Left_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 2.0346,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Left_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Left_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 2.0346,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Left_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_Left_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_Left_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.9586,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_Left_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.9586,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_Left_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_Left_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.9586,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_Left_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Right_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Right_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 2.0346,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Right_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 2.0346,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Right_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Right_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 2.0346,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Right_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_Right_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_Right_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.9586,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_Right_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.9586,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_Right_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_Right_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.9586,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Divider_Right_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Bottom_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Bottom_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Bottom_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5676,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Bottom_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5676,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Bottom_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Bottom_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5676,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Plinth_Front_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5676,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Plinth_Front_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5676,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Plinth_Front_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5676,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Plinth_Back_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5676,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Plinth_Back_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5676,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Plinth_Back_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 1.5676,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Plinth_Brace_Left_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3796,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Plinth_Brace_Left_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3796,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Plinth_Brace_Left_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3796,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Plinth_Brace_Right_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3796,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Plinth_Brace_Right_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3796,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Plinth_Brace_Right_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.3796,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Drawer_Separator_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Drawer_Separator_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Drawer_Separator_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7831,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Drawer_Separator_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7831,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Drawer_Separator_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4566,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Drawer_Separator_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7831,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Left_01_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4406,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Left_01_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4406,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Left_01_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.37385,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Left_01_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.37385,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Left_01_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4406,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Left_01_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.37385,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Right_01_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4406,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Right_01_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4406,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Right_01_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.37385,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Right_01_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.37385,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Right_01_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4406,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Right_01_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.37385,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Center_01_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4406,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Center_01_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4406,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Center_01_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7821,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Center_01_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7821,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Center_01_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4406,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Center_01_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7821,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Center_02_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4406,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Center_02_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4406,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Center_02_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7821,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Center_02_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7821,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Center_02_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4406,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Center_02_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7821,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "ClothesRail_Left",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.36825,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "ClothesRail_Right",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.36825,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Door_Outer_Left_Panel_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.9846,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Outer_Left_Panel_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.9846,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Outer_Left_Panel_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.39585,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Door_Outer_Left_Panel_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.39585,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Door_Outer_Left_Panel_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.39585,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Door_Outer_Left_Panel_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.9846,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Center_Left_Panel_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.2866,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Center_Left_Panel_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.2866,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Center_Left_Panel_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.39585,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Door_Center_Left_Panel_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.39585,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Door_Center_Left_Panel_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.39585,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Door_Center_Left_Panel_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.2866,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Center_Right_Panel_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.2866,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Center_Right_Panel_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.2866,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Center_Right_Panel_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.39585,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Door_Center_Right_Panel_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.39585,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Door_Center_Right_Panel_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.39585,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Door_Center_Right_Panel_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.2866,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Outer_Right_Panel_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.9846,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Outer_Right_Panel_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.9846,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Outer_Right_Panel_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.39585,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Door_Outer_Right_Panel_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.39585,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Door_Outer_Right_Panel_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.39585,
      "factor": 0.25
    },
    {
      "type": "stretch-segment",
      "target": "Door_Outer_Right_Panel_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.9846,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Front_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7961,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Front_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7961,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Front_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7961,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Grip_Recess_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7961,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Grip_Recess_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7961,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Grip_Recess_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7961,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Bottom_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Bottom_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Bottom_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7571,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Bottom_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7571,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Bottom_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Bottom_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7571,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Left_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Left_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Left_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Slide_Left",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.415,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Right_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Right_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Side_Right_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Slide_Right",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.415,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Back_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7251,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Back_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7251,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Back_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7251,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Inner_Front_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7251,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Inner_Front_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7251,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_01_Inner_Front_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7251,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Front_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7961,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Front_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7961,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Front_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7961,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Grip_Recess_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7961,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Grip_Recess_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7961,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Grip_Recess_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7961,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Bottom_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Bottom_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Bottom_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7571,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Bottom_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7571,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Bottom_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Bottom_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7571,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Left_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Left_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Left_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Slide_Left",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.415,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Right_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Right_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Side_Right_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Slide_Right",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.415,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Back_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7251,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Back_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7251,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Back_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7251,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Inner_Front_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7251,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Inner_Front_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7251,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_02_Inner_Front_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7251,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Front_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7961,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Front_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7961,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Front_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7961,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Grip_Recess_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7961,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Grip_Recess_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7961,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Grip_Recess_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7961,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Bottom_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Bottom_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Bottom_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7571,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Bottom_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7571,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Bottom_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Bottom_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7571,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Left_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Left_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Left_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Slide_Left",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.415,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Right_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Right_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Side_Right_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4336,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Slide_Right",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.415,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Back_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7251,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Back_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7251,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Back_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7251,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Inner_Front_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7251,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Inner_Front_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7251,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Drawer_03_Inner_Front_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7251,
      "factor": 0.5
    },
    {
      "type": "delta-move",
      "dimension": "height",
      "axis": "y",
      "targets": [
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
          "target": "Panel_Divider_Left",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_Left_Tile_cpp",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_Left_Tile_cpc",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_Left_Tile_cpm",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_Left_Tile_cmp",
          "factor": -0.5
        },
        {
          "target": "Panel_Divider_Left_Tile_cmc",
          "factor": -0.5
        },
        {
          "target": "Panel_Divider_Left_Tile_cmm",
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
          "target": "Panel_Divider_Right",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_Right_Tile_cpp",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_Right_Tile_cpc",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_Right_Tile_cpm",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_Right_Tile_cmp",
          "factor": -0.5
        },
        {
          "target": "Panel_Divider_Right_Tile_cmc",
          "factor": -0.5
        },
        {
          "target": "Panel_Divider_Right_Tile_cmm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Left_01",
          "factor": 0.666666666667
        },
        {
          "target": "Shelf_Left_01_Pin_Left_Front",
          "factor": 0.666666666667
        },
        {
          "target": "Shelf_Left_01_Pin_Left_Back",
          "factor": 0.666666666667
        },
        {
          "target": "Shelf_Left_01_Pin_Right_Front",
          "factor": 0.666666666667
        },
        {
          "target": "Shelf_Left_01_Pin_Right_Back",
          "factor": 0.666666666667
        },
        {
          "target": "Shelf_Right_01",
          "factor": 0.666666666667
        },
        {
          "target": "Shelf_Right_01_Pin_Left_Front",
          "factor": 0.666666666667
        },
        {
          "target": "Shelf_Right_01_Pin_Left_Back",
          "factor": 0.666666666667
        },
        {
          "target": "Shelf_Right_01_Pin_Right_Front",
          "factor": 0.666666666667
        },
        {
          "target": "Shelf_Right_01_Pin_Right_Back",
          "factor": 0.666666666667
        },
        {
          "target": "Shelf_Center_01",
          "factor": 0.333333333333
        },
        {
          "target": "Shelf_Center_01_Pin_Left_Front",
          "factor": 0.333333333333
        },
        {
          "target": "Shelf_Center_01_Pin_Left_Back",
          "factor": 0.333333333333
        },
        {
          "target": "Shelf_Center_01_Pin_Right_Front",
          "factor": 0.333333333333
        },
        {
          "target": "Shelf_Center_01_Pin_Right_Back",
          "factor": 0.333333333333
        },
        {
          "target": "Shelf_Center_02",
          "factor": 0.666666666667
        },
        {
          "target": "Shelf_Center_02_Pin_Left_Front",
          "factor": 0.666666666667
        },
        {
          "target": "Shelf_Center_02_Pin_Left_Back",
          "factor": 0.666666666667
        },
        {
          "target": "Shelf_Center_02_Pin_Right_Front",
          "factor": 0.666666666667
        },
        {
          "target": "Shelf_Center_02_Pin_Right_Back",
          "factor": 0.666666666667
        },
        {
          "target": "ClothesRail_Left",
          "factor": 0.666666666667
        },
        {
          "target": "ClothesRail_Left_Socket_Left",
          "factor": 0.666666666667
        },
        {
          "target": "ClothesRail_Left_Socket_Right",
          "factor": 0.666666666667
        },
        {
          "target": "ClothesRail_Right",
          "factor": 0.666666666667
        },
        {
          "target": "ClothesRail_Right_Socket_Left",
          "factor": 0.666666666667
        },
        {
          "target": "ClothesRail_Right_Socket_Right",
          "factor": 0.666666666667
        },
        {
          "target": "Door_Outer_Left_Panel",
          "factor": 0.5
        },
        {
          "target": "Door_Outer_Left_Panel_Tile_ppc",
          "factor": 0.5
        },
        {
          "target": "Door_Outer_Left_Panel_Tile_pmc",
          "factor": -0.5
        },
        {
          "target": "Door_Outer_Left_Panel_Tile_mpc",
          "factor": 0.5
        },
        {
          "target": "Door_Outer_Left_Panel_Tile_mmc",
          "factor": -0.5
        },
        {
          "target": "Door_Outer_Left_Panel_Tile_cpc",
          "factor": 0.5
        },
        {
          "target": "Door_Outer_Left_Panel_Tile_cmc",
          "factor": -0.5
        },
        {
          "target": "Hinge_Outer_Left_02_Cup",
          "factor": 0.5
        },
        {
          "target": "Hinge_Outer_Left_02_Plate",
          "factor": 0.5
        },
        {
          "target": "Hinge_Outer_Left_03_Cup",
          "factor": 1
        },
        {
          "target": "Hinge_Outer_Left_03_Plate",
          "factor": 1
        },
        {
          "target": "Door_Center_Left_Panel",
          "factor": 0.5
        },
        {
          "target": "Door_Center_Left_Panel_Tile_ppc",
          "factor": 0.5
        },
        {
          "target": "Door_Center_Left_Panel_Tile_pmc",
          "factor": -0.5
        },
        {
          "target": "Door_Center_Left_Panel_Tile_mpc",
          "factor": 0.5
        },
        {
          "target": "Door_Center_Left_Panel_Tile_mmc",
          "factor": -0.5
        },
        {
          "target": "Door_Center_Left_Panel_Tile_cpc",
          "factor": 0.5
        },
        {
          "target": "Door_Center_Left_Panel_Tile_cmc",
          "factor": -0.5
        },
        {
          "target": "Hinge_Center_Left_02_Cup",
          "factor": 1
        },
        {
          "target": "Hinge_Center_Left_02_Plate",
          "factor": 1
        },
        {
          "target": "Door_Center_Right_Panel",
          "factor": 0.5
        },
        {
          "target": "Door_Center_Right_Panel_Tile_ppc",
          "factor": 0.5
        },
        {
          "target": "Door_Center_Right_Panel_Tile_pmc",
          "factor": -0.5
        },
        {
          "target": "Door_Center_Right_Panel_Tile_mpc",
          "factor": 0.5
        },
        {
          "target": "Door_Center_Right_Panel_Tile_mmc",
          "factor": -0.5
        },
        {
          "target": "Door_Center_Right_Panel_Tile_cpc",
          "factor": 0.5
        },
        {
          "target": "Door_Center_Right_Panel_Tile_cmc",
          "factor": -0.5
        },
        {
          "target": "Hinge_Center_Right_02_Cup",
          "factor": 1
        },
        {
          "target": "Hinge_Center_Right_02_Plate",
          "factor": 1
        },
        {
          "target": "Door_Outer_Right_Panel",
          "factor": 0.5
        },
        {
          "target": "Door_Outer_Right_Panel_Tile_ppc",
          "factor": 0.5
        },
        {
          "target": "Door_Outer_Right_Panel_Tile_pmc",
          "factor": -0.5
        },
        {
          "target": "Door_Outer_Right_Panel_Tile_mpc",
          "factor": 0.5
        },
        {
          "target": "Door_Outer_Right_Panel_Tile_mmc",
          "factor": -0.5
        },
        {
          "target": "Door_Outer_Right_Panel_Tile_cpc",
          "factor": 0.5
        },
        {
          "target": "Door_Outer_Right_Panel_Tile_cmc",
          "factor": -0.5
        },
        {
          "target": "Hinge_Outer_Right_02_Cup",
          "factor": 0.5
        },
        {
          "target": "Hinge_Outer_Right_02_Plate",
          "factor": 0.5
        },
        {
          "target": "Hinge_Outer_Right_03_Cup",
          "factor": 1
        },
        {
          "target": "Hinge_Outer_Right_03_Plate",
          "factor": 1
        }
      ]
    },
    {
      "type": "delta-move",
      "dimension": "depth",
      "axis": "z",
      "targets": [
        {
          "target": "Panel_Back",
          "factor": -0.5
        },
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
          "target": "Panel_Divider_Left_Tile_cpp",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_Left_Tile_cpm",
          "factor": -0.5
        },
        {
          "target": "Panel_Divider_Left_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_Left_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Panel_Divider_Left_Tile_cmp",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_Left_Tile_cmm",
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
          "target": "Panel_Divider_Right_Tile_cpp",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_Right_Tile_cpm",
          "factor": -0.5
        },
        {
          "target": "Panel_Divider_Right_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_Right_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Panel_Divider_Right_Tile_cmp",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_Right_Tile_cmm",
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
          "target": "Plinth_Front",
          "factor": 0.5
        },
        {
          "target": "Plinth_Back",
          "factor": -0.5
        },
        {
          "target": "Plinth_Brace_Left_Tile_cpp",
          "factor": 0.5
        },
        {
          "target": "Plinth_Brace_Left_Tile_cpm",
          "factor": -0.5
        },
        {
          "target": "Plinth_Brace_Left_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Plinth_Brace_Left_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Plinth_Brace_Left_Tile_cmp",
          "factor": 0.5
        },
        {
          "target": "Plinth_Brace_Left_Tile_cmm",
          "factor": -0.5
        },
        {
          "target": "Plinth_Brace_Right_Tile_cpp",
          "factor": 0.5
        },
        {
          "target": "Plinth_Brace_Right_Tile_cpm",
          "factor": -0.5
        },
        {
          "target": "Plinth_Brace_Right_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Plinth_Brace_Right_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Plinth_Brace_Right_Tile_cmp",
          "factor": 0.5
        },
        {
          "target": "Plinth_Brace_Right_Tile_cmm",
          "factor": -0.5
        },
        {
          "target": "Panel_Drawer_Separator_Tile_pcp",
          "factor": 0.5
        },
        {
          "target": "Panel_Drawer_Separator_Tile_pcm",
          "factor": -0.5
        },
        {
          "target": "Panel_Drawer_Separator_Tile_mcm",
          "factor": -0.5
        },
        {
          "target": "Panel_Drawer_Separator_Tile_mcp",
          "factor": 0.5
        },
        {
          "target": "Panel_Drawer_Separator_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Panel_Drawer_Separator_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Shelf_Left_01_Tile_pcp",
          "factor": 0.5
        },
        {
          "target": "Shelf_Left_01_Tile_pcm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Left_01_Tile_mcm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Left_01_Tile_mcp",
          "factor": 0.5
        },
        {
          "target": "Shelf_Left_01_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Left_01_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Shelf_Left_01_Pin_Left_Front",
          "factor": 0.5
        },
        {
          "target": "Shelf_Left_01_Pin_Left_Back",
          "factor": -0.5
        },
        {
          "target": "Shelf_Left_01_Pin_Right_Front",
          "factor": 0.5
        },
        {
          "target": "Shelf_Left_01_Pin_Right_Back",
          "factor": -0.5
        },
        {
          "target": "Shelf_Right_01_Tile_pcp",
          "factor": 0.5
        },
        {
          "target": "Shelf_Right_01_Tile_pcm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Right_01_Tile_mcm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Right_01_Tile_mcp",
          "factor": 0.5
        },
        {
          "target": "Shelf_Right_01_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Right_01_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Shelf_Right_01_Pin_Left_Front",
          "factor": 0.5
        },
        {
          "target": "Shelf_Right_01_Pin_Left_Back",
          "factor": -0.5
        },
        {
          "target": "Shelf_Right_01_Pin_Right_Front",
          "factor": 0.5
        },
        {
          "target": "Shelf_Right_01_Pin_Right_Back",
          "factor": -0.5
        },
        {
          "target": "Shelf_Center_01_Tile_pcp",
          "factor": 0.5
        },
        {
          "target": "Shelf_Center_01_Tile_pcm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Center_01_Tile_mcm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Center_01_Tile_mcp",
          "factor": 0.5
        },
        {
          "target": "Shelf_Center_01_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Center_01_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Shelf_Center_01_Pin_Left_Front",
          "factor": 0.5
        },
        {
          "target": "Shelf_Center_01_Pin_Left_Back",
          "factor": -0.5
        },
        {
          "target": "Shelf_Center_01_Pin_Right_Front",
          "factor": 0.5
        },
        {
          "target": "Shelf_Center_01_Pin_Right_Back",
          "factor": -0.5
        },
        {
          "target": "Shelf_Center_02_Tile_pcp",
          "factor": 0.5
        },
        {
          "target": "Shelf_Center_02_Tile_pcm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Center_02_Tile_mcm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Center_02_Tile_mcp",
          "factor": 0.5
        },
        {
          "target": "Shelf_Center_02_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Center_02_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Shelf_Center_02_Pin_Left_Front",
          "factor": 0.5
        },
        {
          "target": "Shelf_Center_02_Pin_Left_Back",
          "factor": -0.5
        },
        {
          "target": "Shelf_Center_02_Pin_Right_Front",
          "factor": 0.5
        },
        {
          "target": "Shelf_Center_02_Pin_Right_Back",
          "factor": -0.5
        },
        {
          "target": "Door_Outer_Left_Hinge",
          "factor": 0.5
        },
        {
          "target": "Hinge_Outer_Left_01_Plate",
          "factor": 0.5
        },
        {
          "target": "Hinge_Outer_Left_02_Plate",
          "factor": 0.5
        },
        {
          "target": "Hinge_Outer_Left_03_Plate",
          "factor": 0.5
        },
        {
          "target": "Door_Center_Left_Hinge",
          "factor": 0.5
        },
        {
          "target": "Hinge_Center_Left_01_Plate",
          "factor": 0.5
        },
        {
          "target": "Hinge_Center_Left_02_Plate",
          "factor": 0.5
        },
        {
          "target": "Door_Center_Right_Hinge",
          "factor": 0.5
        },
        {
          "target": "Hinge_Center_Right_01_Plate",
          "factor": 0.5
        },
        {
          "target": "Hinge_Center_Right_02_Plate",
          "factor": 0.5
        },
        {
          "target": "Door_Outer_Right_Hinge",
          "factor": 0.5
        },
        {
          "target": "Hinge_Outer_Right_01_Plate",
          "factor": 0.5
        },
        {
          "target": "Hinge_Outer_Right_02_Plate",
          "factor": 0.5
        },
        {
          "target": "Hinge_Outer_Right_03_Plate",
          "factor": 0.5
        },
        {
          "target": "Drawer_01_Front",
          "factor": 0.5
        },
        {
          "target": "Drawer_01_Grip_Recess",
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
          "target": "Drawer_02_Front",
          "factor": 0.5
        },
        {
          "target": "Drawer_02_Grip_Recess",
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
          "target": "Drawer_03_Front",
          "factor": 0.5
        },
        {
          "target": "Drawer_03_Grip_Recess",
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
        }
      ]
    },
    {
      "type": "delta-move",
      "dimension": "width",
      "axis": "x",
      "targets": [
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
          "target": "Panel_Divider_Left",
          "factor": -0.25
        },
        {
          "target": "Panel_Side_Right",
          "factor": 0.5
        },
        {
          "target": "Panel_Divider_Right",
          "factor": 0.25
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
          "target": "Plinth_Front_Tile_ppc",
          "factor": 0.5
        },
        {
          "target": "Plinth_Front_Tile_pcc",
          "factor": 0.5
        },
        {
          "target": "Plinth_Front_Tile_pmc",
          "factor": 0.5
        },
        {
          "target": "Plinth_Front_Tile_mpc",
          "factor": -0.5
        },
        {
          "target": "Plinth_Front_Tile_mcc",
          "factor": -0.5
        },
        {
          "target": "Plinth_Front_Tile_mmc",
          "factor": -0.5
        },
        {
          "target": "Plinth_Back_Tile_ppc",
          "factor": 0.5
        },
        {
          "target": "Plinth_Back_Tile_pcc",
          "factor": 0.5
        },
        {
          "target": "Plinth_Back_Tile_pmc",
          "factor": 0.5
        },
        {
          "target": "Plinth_Back_Tile_mpc",
          "factor": -0.5
        },
        {
          "target": "Plinth_Back_Tile_mcc",
          "factor": -0.5
        },
        {
          "target": "Plinth_Back_Tile_mmc",
          "factor": -0.5
        },
        {
          "target": "Plinth_Brace_Left",
          "factor": -0.25
        },
        {
          "target": "Plinth_Brace_Right",
          "factor": 0.25
        },
        {
          "target": "Panel_Drawer_Separator_Tile_pcp",
          "factor": 0.25
        },
        {
          "target": "Panel_Drawer_Separator_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Panel_Drawer_Separator_Tile_pcm",
          "factor": 0.25
        },
        {
          "target": "Panel_Drawer_Separator_Tile_mcm",
          "factor": -0.25
        },
        {
          "target": "Panel_Drawer_Separator_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Panel_Drawer_Separator_Tile_mcp",
          "factor": -0.25
        },
        {
          "target": "Shelf_Left_01",
          "factor": -0.375
        },
        {
          "target": "Shelf_Left_01_Tile_pcp",
          "factor": 0.125
        },
        {
          "target": "Shelf_Left_01_Tile_pcc",
          "factor": 0.125
        },
        {
          "target": "Shelf_Left_01_Tile_pcm",
          "factor": 0.125
        },
        {
          "target": "Shelf_Left_01_Tile_mcm",
          "factor": -0.125
        },
        {
          "target": "Shelf_Left_01_Tile_mcc",
          "factor": -0.125
        },
        {
          "target": "Shelf_Left_01_Tile_mcp",
          "factor": -0.125
        },
        {
          "target": "Shelf_Left_01_Pin_Left_Front",
          "factor": -0.5
        },
        {
          "target": "Shelf_Left_01_Pin_Left_Back",
          "factor": -0.5
        },
        {
          "target": "Shelf_Left_01_Pin_Right_Front",
          "factor": -0.25
        },
        {
          "target": "Shelf_Left_01_Pin_Right_Back",
          "factor": -0.25
        },
        {
          "target": "Shelf_Right_01",
          "factor": 0.375
        },
        {
          "target": "Shelf_Right_01_Tile_pcp",
          "factor": 0.125
        },
        {
          "target": "Shelf_Right_01_Tile_pcc",
          "factor": 0.125
        },
        {
          "target": "Shelf_Right_01_Tile_pcm",
          "factor": 0.125
        },
        {
          "target": "Shelf_Right_01_Tile_mcm",
          "factor": -0.125
        },
        {
          "target": "Shelf_Right_01_Tile_mcc",
          "factor": -0.125
        },
        {
          "target": "Shelf_Right_01_Tile_mcp",
          "factor": -0.125
        },
        {
          "target": "Shelf_Right_01_Pin_Left_Front",
          "factor": 0.25
        },
        {
          "target": "Shelf_Right_01_Pin_Left_Back",
          "factor": 0.25
        },
        {
          "target": "Shelf_Right_01_Pin_Right_Front",
          "factor": 0.5
        },
        {
          "target": "Shelf_Right_01_Pin_Right_Back",
          "factor": 0.5
        },
        {
          "target": "Shelf_Center_01_Tile_pcp",
          "factor": 0.25
        },
        {
          "target": "Shelf_Center_01_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Shelf_Center_01_Tile_pcm",
          "factor": 0.25
        },
        {
          "target": "Shelf_Center_01_Tile_mcm",
          "factor": -0.25
        },
        {
          "target": "Shelf_Center_01_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Shelf_Center_01_Tile_mcp",
          "factor": -0.25
        },
        {
          "target": "Shelf_Center_01_Pin_Left_Front",
          "factor": -0.25
        },
        {
          "target": "Shelf_Center_01_Pin_Left_Back",
          "factor": -0.25
        },
        {
          "target": "Shelf_Center_01_Pin_Right_Front",
          "factor": 0.25
        },
        {
          "target": "Shelf_Center_01_Pin_Right_Back",
          "factor": 0.25
        },
        {
          "target": "Shelf_Center_02_Tile_pcp",
          "factor": 0.25
        },
        {
          "target": "Shelf_Center_02_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Shelf_Center_02_Tile_pcm",
          "factor": 0.25
        },
        {
          "target": "Shelf_Center_02_Tile_mcm",
          "factor": -0.25
        },
        {
          "target": "Shelf_Center_02_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Shelf_Center_02_Tile_mcp",
          "factor": -0.25
        },
        {
          "target": "Shelf_Center_02_Pin_Left_Front",
          "factor": -0.25
        },
        {
          "target": "Shelf_Center_02_Pin_Left_Back",
          "factor": -0.25
        },
        {
          "target": "Shelf_Center_02_Pin_Right_Front",
          "factor": 0.25
        },
        {
          "target": "Shelf_Center_02_Pin_Right_Back",
          "factor": 0.25
        },
        {
          "target": "ClothesRail_Left",
          "factor": -0.375
        },
        {
          "target": "ClothesRail_Left_Socket_Left",
          "factor": -0.5
        },
        {
          "target": "ClothesRail_Left_Socket_Right",
          "factor": -0.25
        },
        {
          "target": "ClothesRail_Right",
          "factor": 0.375
        },
        {
          "target": "ClothesRail_Right_Socket_Left",
          "factor": 0.25
        },
        {
          "target": "ClothesRail_Right_Socket_Right",
          "factor": 0.5
        },
        {
          "target": "Door_Outer_Left_Hinge",
          "factor": -0.5
        },
        {
          "target": "Door_Outer_Left_Panel",
          "factor": 0.125
        },
        {
          "target": "Door_Outer_Left_Panel_Tile_ppc",
          "factor": 0.125
        },
        {
          "target": "Door_Outer_Left_Panel_Tile_pcc",
          "factor": 0.125
        },
        {
          "target": "Door_Outer_Left_Panel_Tile_pmc",
          "factor": 0.125
        },
        {
          "target": "Door_Outer_Left_Panel_Tile_mpc",
          "factor": -0.125
        },
        {
          "target": "Door_Outer_Left_Panel_Tile_mcc",
          "factor": -0.125
        },
        {
          "target": "Door_Outer_Left_Panel_Tile_mmc",
          "factor": -0.125
        },
        {
          "target": "Hinge_Outer_Left_01_Plate",
          "factor": -0.5
        },
        {
          "target": "Hinge_Outer_Left_02_Plate",
          "factor": -0.5
        },
        {
          "target": "Hinge_Outer_Left_03_Plate",
          "factor": -0.5
        },
        {
          "target": "Door_Center_Left_Hinge",
          "factor": -0.25
        },
        {
          "target": "Door_Center_Left_Panel",
          "factor": 0.125
        },
        {
          "target": "Door_Center_Left_Panel_Tile_ppc",
          "factor": 0.125
        },
        {
          "target": "Door_Center_Left_Panel_Tile_pcc",
          "factor": 0.125
        },
        {
          "target": "Door_Center_Left_Panel_Tile_pmc",
          "factor": 0.125
        },
        {
          "target": "Door_Center_Left_Panel_Tile_mpc",
          "factor": -0.125
        },
        {
          "target": "Door_Center_Left_Panel_Tile_mcc",
          "factor": -0.125
        },
        {
          "target": "Door_Center_Left_Panel_Tile_mmc",
          "factor": -0.125
        },
        {
          "target": "Hinge_Center_Left_01_Plate",
          "factor": -0.25
        },
        {
          "target": "Hinge_Center_Left_02_Plate",
          "factor": -0.25
        },
        {
          "target": "Door_Center_Right_Hinge",
          "factor": 0.25
        },
        {
          "target": "Door_Center_Right_Panel",
          "factor": -0.125
        },
        {
          "target": "Door_Center_Right_Panel_Tile_ppc",
          "factor": 0.125
        },
        {
          "target": "Door_Center_Right_Panel_Tile_pcc",
          "factor": 0.125
        },
        {
          "target": "Door_Center_Right_Panel_Tile_pmc",
          "factor": 0.125
        },
        {
          "target": "Door_Center_Right_Panel_Tile_mpc",
          "factor": -0.125
        },
        {
          "target": "Door_Center_Right_Panel_Tile_mcc",
          "factor": -0.125
        },
        {
          "target": "Door_Center_Right_Panel_Tile_mmc",
          "factor": -0.125
        },
        {
          "target": "Hinge_Center_Right_01_Plate",
          "factor": 0.25
        },
        {
          "target": "Hinge_Center_Right_02_Plate",
          "factor": 0.25
        },
        {
          "target": "Door_Outer_Right_Hinge",
          "factor": 0.5
        },
        {
          "target": "Door_Outer_Right_Panel",
          "factor": -0.125
        },
        {
          "target": "Door_Outer_Right_Panel_Tile_ppc",
          "factor": 0.125
        },
        {
          "target": "Door_Outer_Right_Panel_Tile_pcc",
          "factor": 0.125
        },
        {
          "target": "Door_Outer_Right_Panel_Tile_pmc",
          "factor": 0.125
        },
        {
          "target": "Door_Outer_Right_Panel_Tile_mpc",
          "factor": -0.125
        },
        {
          "target": "Door_Outer_Right_Panel_Tile_mcc",
          "factor": -0.125
        },
        {
          "target": "Door_Outer_Right_Panel_Tile_mmc",
          "factor": -0.125
        },
        {
          "target": "Hinge_Outer_Right_01_Plate",
          "factor": 0.5
        },
        {
          "target": "Hinge_Outer_Right_02_Plate",
          "factor": 0.5
        },
        {
          "target": "Hinge_Outer_Right_03_Plate",
          "factor": 0.5
        },
        {
          "target": "Drawer_01_Front_Tile_ppc",
          "factor": 0.25
        },
        {
          "target": "Drawer_01_Front_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_01_Front_Tile_pmc",
          "factor": 0.25
        },
        {
          "target": "Drawer_01_Front_Tile_mpc",
          "factor": -0.25
        },
        {
          "target": "Drawer_01_Front_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_01_Front_Tile_mmc",
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
          "target": "Drawer_01_Slide_Left",
          "factor": -0.25
        },
        {
          "target": "Drawer_01_Side_Right",
          "factor": 0.25
        },
        {
          "target": "Drawer_01_Slide_Right",
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
          "target": "Drawer_02_Front_Tile_ppc",
          "factor": 0.25
        },
        {
          "target": "Drawer_02_Front_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_02_Front_Tile_pmc",
          "factor": 0.25
        },
        {
          "target": "Drawer_02_Front_Tile_mpc",
          "factor": -0.25
        },
        {
          "target": "Drawer_02_Front_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_02_Front_Tile_mmc",
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
          "target": "Drawer_02_Slide_Left",
          "factor": -0.25
        },
        {
          "target": "Drawer_02_Side_Right",
          "factor": 0.25
        },
        {
          "target": "Drawer_02_Slide_Right",
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
          "target": "Drawer_03_Front_Tile_ppc",
          "factor": 0.25
        },
        {
          "target": "Drawer_03_Front_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Drawer_03_Front_Tile_pmc",
          "factor": 0.25
        },
        {
          "target": "Drawer_03_Front_Tile_mpc",
          "factor": -0.25
        },
        {
          "target": "Drawer_03_Front_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Drawer_03_Front_Tile_mmc",
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
          "target": "Drawer_03_Slide_Left",
          "factor": -0.25
        },
        {
          "target": "Drawer_03_Side_Right",
          "factor": 0.25
        },
        {
          "target": "Drawer_03_Slide_Right",
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
        }
      ]
    }
  ],
  "textureAxes": {},
  "materialSlots": {
    "hardware": {
      "label": "Цвет фурнитуры",
      "targets": [
        "Hardware_Metal"
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

export const BOARD_MATERIAL_TARGETS = {
  "carcass": [
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
    "Board_Plinth_ppc_X",
    "Board_Plinth_pcc_X",
    "Board_Plinth_pmc_X",
    "Board_Plinth_mpc_X",
    "Board_Plinth_mcc_X",
    "Board_Plinth_mmc_X",
    "Board_Plinth_mpc_Y",
    "Board_Plinth_cpc_Y",
    "Board_Plinth_ppc_Y",
    "Board_Plinth_mmc_Y",
    "Board_Plinth_cmc_Y",
    "Board_Plinth_pmc_Y",
    "Board_Plinth_mpc_Z",
    "Board_Plinth_cpc_Z",
    "Board_Plinth_ppc_Z",
    "Board_Plinth_mcc_Z",
    "Board_Plinth_ccc_Z",
    "Board_Plinth_pcc_Z",
    "Board_Plinth_mmc_Z",
    "Board_Plinth_cmc_Z",
    "Board_Plinth_pmc_Z",
    "Board_PlinthBrace_cpp_X",
    "Board_PlinthBrace_cpc_X",
    "Board_PlinthBrace_cpm_X",
    "Board_PlinthBrace_ccp_X",
    "Board_PlinthBrace_ccc_X",
    "Board_PlinthBrace_ccm_X",
    "Board_PlinthBrace_cmp_X",
    "Board_PlinthBrace_cmc_X",
    "Board_PlinthBrace_cmm_X",
    "Board_PlinthBrace_cpm_Y",
    "Board_PlinthBrace_cpc_Y",
    "Board_PlinthBrace_cpp_Y",
    "Board_PlinthBrace_cmp_Y",
    "Board_PlinthBrace_cmc_Y",
    "Board_PlinthBrace_cmm_Y",
    "Board_PlinthBrace_cpp_Z",
    "Board_PlinthBrace_ccp_Z",
    "Board_PlinthBrace_cmp_Z",
    "Board_PlinthBrace_cpm_Z",
    "Board_PlinthBrace_ccm_Z",
    "Board_PlinthBrace_cmm_Z",
    "Board_DrawerSeparator_pcp_X",
    "Board_DrawerSeparator_pcc_X",
    "Board_DrawerSeparator_pcm_X",
    "Board_DrawerSeparator_mcm_X",
    "Board_DrawerSeparator_mcc_X",
    "Board_DrawerSeparator_mcp_X",
    "Board_DrawerSeparator_mcm_Y",
    "Board_DrawerSeparator_ccm_Y",
    "Board_DrawerSeparator_pcm_Y",
    "Board_DrawerSeparator_mcc_Y",
    "Board_DrawerSeparator_ccc_Y",
    "Board_DrawerSeparator_pcc_Y",
    "Board_DrawerSeparator_mcp_Y",
    "Board_DrawerSeparator_ccp_Y",
    "Board_DrawerSeparator_pcp_Y",
    "Board_DrawerSeparator_mcp_Z",
    "Board_DrawerSeparator_ccp_Z",
    "Board_DrawerSeparator_pcp_Z",
    "Board_DrawerSeparator_pcm_Z",
    "Board_DrawerSeparator_ccm_Z",
    "Board_DrawerSeparator_mcm_Z",
    "Board_Shelf_Side_pcp_X",
    "Board_Shelf_Side_pcc_X",
    "Board_Shelf_Side_pcm_X",
    "Board_Shelf_Side_mcm_X",
    "Board_Shelf_Side_mcc_X",
    "Board_Shelf_Side_mcp_X",
    "Board_Shelf_Side_mcm_Y",
    "Board_Shelf_Side_ccm_Y",
    "Board_Shelf_Side_pcm_Y",
    "Board_Shelf_Side_mcc_Y",
    "Board_Shelf_Side_ccc_Y",
    "Board_Shelf_Side_pcc_Y",
    "Board_Shelf_Side_mcp_Y",
    "Board_Shelf_Side_ccp_Y",
    "Board_Shelf_Side_pcp_Y",
    "Board_Shelf_Side_mcp_Z",
    "Board_Shelf_Side_ccp_Z",
    "Board_Shelf_Side_pcp_Z",
    "Board_Shelf_Side_pcm_Z",
    "Board_Shelf_Side_ccm_Z",
    "Board_Shelf_Side_mcm_Z",
    "Board_Shelf_Center_pcp_X",
    "Board_Shelf_Center_pcc_X",
    "Board_Shelf_Center_pcm_X",
    "Board_Shelf_Center_mcm_X",
    "Board_Shelf_Center_mcc_X",
    "Board_Shelf_Center_mcp_X",
    "Board_Shelf_Center_mcm_Y",
    "Board_Shelf_Center_ccm_Y",
    "Board_Shelf_Center_pcm_Y",
    "Board_Shelf_Center_mcc_Y",
    "Board_Shelf_Center_ccc_Y",
    "Board_Shelf_Center_pcc_Y",
    "Board_Shelf_Center_mcp_Y",
    "Board_Shelf_Center_ccp_Y",
    "Board_Shelf_Center_pcp_Y",
    "Board_Shelf_Center_mcp_Z",
    "Board_Shelf_Center_ccp_Z",
    "Board_Shelf_Center_pcp_Z",
    "Board_Shelf_Center_pcm_Z",
    "Board_Shelf_Center_ccm_Z",
    "Board_Shelf_Center_mcm_Z",
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
    "Front_Door_Tall_ppc_X",
    "Front_Door_Tall_pcc_X",
    "Front_Door_Tall_pmc_X",
    "Front_Door_Tall_mpc_X",
    "Front_Door_Tall_mcc_X",
    "Front_Door_Tall_mmc_X",
    "Front_Door_Tall_mpc_Y",
    "Front_Door_Tall_cpc_Y",
    "Front_Door_Tall_ppc_Y",
    "Front_Door_Tall_mmc_Y",
    "Front_Door_Tall_cmc_Y",
    "Front_Door_Tall_pmc_Y",
    "Front_Door_Tall_mpc_Z",
    "Front_Door_Tall_cpc_Z",
    "Front_Door_Tall_ppc_Z",
    "Front_Door_Tall_mcc_Z",
    "Front_Door_Tall_ccc_Z",
    "Front_Door_Tall_pcc_Z",
    "Front_Door_Tall_mmc_Z",
    "Front_Door_Tall_cmc_Z",
    "Front_Door_Tall_pmc_Z",
    "Front_Door_Short_ppc_X",
    "Front_Door_Short_pcc_X",
    "Front_Door_Short_pmc_X",
    "Front_Door_Short_mpc_X",
    "Front_Door_Short_mcc_X",
    "Front_Door_Short_mmc_X",
    "Front_Door_Short_mpc_Y",
    "Front_Door_Short_cpc_Y",
    "Front_Door_Short_ppc_Y",
    "Front_Door_Short_mmc_Y",
    "Front_Door_Short_cmc_Y",
    "Front_Door_Short_pmc_Y",
    "Front_Door_Short_mpc_Z",
    "Front_Door_Short_cpc_Z",
    "Front_Door_Short_ppc_Z",
    "Front_Door_Short_mcc_Z",
    "Front_Door_Short_ccc_Z",
    "Front_Door_Short_pcc_Z",
    "Front_Door_Short_mmc_Z",
    "Front_Door_Short_cmc_Z",
    "Front_Door_Short_pmc_Z",
    "Front_DrawerFront_ppc_X",
    "Front_DrawerFront_pcc_X",
    "Front_DrawerFront_pmc_X",
    "Front_DrawerFront_mpc_X",
    "Front_DrawerFront_mcc_X",
    "Front_DrawerFront_mmc_X",
    "Front_DrawerFront_mpc_Y",
    "Front_DrawerFront_cpc_Y",
    "Front_DrawerFront_ppc_Y",
    "Front_DrawerFront_mmc_Y",
    "Front_DrawerFront_cmc_Y",
    "Front_DrawerFront_pmc_Y",
    "Front_DrawerFront_mpc_Z",
    "Front_DrawerFront_cpc_Z",
    "Front_DrawerFront_ppc_Z",
    "Front_DrawerFront_mcc_Z",
    "Front_DrawerFront_ccc_Z",
    "Front_DrawerFront_pcc_Z",
    "Front_DrawerFront_mmc_Z",
    "Front_DrawerFront_cmc_Z",
    "Front_DrawerFront_pmc_Z",
    "Front_GripRecess_ppc_X",
    "Front_GripRecess_pcc_X",
    "Front_GripRecess_pmc_X",
    "Front_GripRecess_mpc_X",
    "Front_GripRecess_mcc_X",
    "Front_GripRecess_mmc_X",
    "Front_GripRecess_mpc_Y",
    "Front_GripRecess_cpc_Y",
    "Front_GripRecess_ppc_Y",
    "Front_GripRecess_mmc_Y",
    "Front_GripRecess_cmc_Y",
    "Front_GripRecess_pmc_Y",
    "Front_GripRecess_mpc_Z",
    "Front_GripRecess_cpc_Z",
    "Front_GripRecess_ppc_Z",
    "Front_GripRecess_mcc_Z",
    "Front_GripRecess_ccc_Z",
    "Front_GripRecess_pcc_Z",
    "Front_GripRecess_mmc_Z",
    "Front_GripRecess_cmc_Z",
    "Front_GripRecess_pmc_Z"
  ]
} as const

// Только material-review: позволяет проверить независимость slots с РЕАЛЬНЫМИ
// finish IDs каталога. Не обещает стабильный UV рисунка при resize.
export function createMaterialReviewDefinition(carcassFinish: string, frontsFinish: string, allowedFinishes: readonly string[]): FurnitureDefinition {
  for (const id of [carcassFinish, frontsFinish]) if (!allowedFinishes.includes(id)) throw new Error('Default finish must be allowed')
  return { ...WARDROBE_07_CONFIG, materialSlots: { ...WARDROBE_07_CONFIG.materialSlots,
    carcass: { label: 'Корпус и полки', targets: BOARD_MATERIAL_TARGETS.carcass, defaultFinish: carcassFinish, allowedFinishes },
    fronts: { label: 'Фасады', targets: BOARD_MATERIAL_TARGETS.fronts, defaultFinish: frontsFinish, allowedFinishes },
  } }
}
