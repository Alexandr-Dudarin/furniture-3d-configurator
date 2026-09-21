import type { FurnitureDefinition } from '../../furniture/types'

// Автоматически создано build_model.mjs. Размеры проверяются текущим generic controller.
// Серые исходные материалы остаются в GLB: board finish IDs ещё не зарегистрированы.
// Точные UV-привязки находятся в model-contract.json и требуют общего расширения.
export const WARDROBE_09_CONFIG = {
  "id": "wardrobe-09-chelsea-two-door",
  "label": "Двухдверный шкаф «Челси»",
  "modelUrl": "/models/wardrobe-09-chelsea-two-door.glb",
  "dimensions": {
    "width": {
      "label": "Ширина",
      "base": 0.802,
      "min": 0.6,
      "max": 1,
      "step": 0.001
    },
    "height": {
      "label": "Высота",
      "base": 2.022,
      "min": 1.9,
      "max": 2.4,
      "step": 0.001
    },
    "depth": {
      "label": "Глубина",
      "base": 0.514,
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
      "target": "Panel_Top_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.5126,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Top_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.5126,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Top_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.8006,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Top_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.8006,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Top_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.5126,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Top_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.8006,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Left_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4886,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Left_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 2.0046,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Left_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 2.0046,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Left_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4886,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Left_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 2.0046,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Left_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4886,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Right_Tile_cpc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4886,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Right_Tile_ccp",
      "dimension": "height",
      "axis": "y",
      "baseLength": 2.0046,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Right_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 2.0046,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Right_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4886,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Right_Tile_ccm",
      "dimension": "height",
      "axis": "y",
      "baseLength": 2.0046,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Side_Right_Tile_cmc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4886,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Back_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.9466,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Back_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.9466,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Back_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7986,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Back_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7986,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Back_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7986,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Back_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.9466,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Bottom_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4886,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Bottom_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4886,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Bottom_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7666,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Bottom_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7666,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Bottom_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4886,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Panel_Bottom_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7666,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Plinth_Front_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7666,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Plinth_Front_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7666,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Plinth_Front_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7666,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Lower_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4886,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Lower_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4886,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Lower_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7666,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Lower_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7666,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Lower_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4886,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Lower_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7666,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Upper_Tile_pcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4886,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Upper_Tile_mcc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4886,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Upper_Tile_ccm",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7666,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Upper_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7666,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Upper_Tile_ccc",
      "dimension": "depth",
      "axis": "z",
      "baseLength": 0.4886,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Shelf_Upper_Tile_ccp",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7666,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Rear_Brace_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7666,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Rear_Brace_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7666,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Rear_Brace_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.7666,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "ClothesRail_Oval",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.765,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Panel_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.9316,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Panel_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.9316,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Panel_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.3956,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Panel_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.3956,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Panel_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.3956,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Door_Left_Panel_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.9316,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Panel_Tile_pcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.9316,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Panel_Tile_mcc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.9316,
      "factor": 1
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Panel_Tile_cpc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.3956,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Panel_Tile_cmc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.3956,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Panel_Tile_ccc",
      "dimension": "width",
      "axis": "x",
      "baseLength": 0.3956,
      "factor": 0.5
    },
    {
      "type": "stretch-segment",
      "target": "Door_Right_Panel_Tile_ccc",
      "dimension": "height",
      "axis": "y",
      "baseLength": 1.9316,
      "factor": 1
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
          "target": "Shelf_Upper",
          "factor": 1
        },
        {
          "target": "Rear_Brace",
          "factor": 0.5
        },
        {
          "target": "ClothesRail_Oval",
          "factor": 1
        },
        {
          "target": "ClothesRail_Socket_Left",
          "factor": 1
        },
        {
          "target": "ClothesRail_Socket_Right",
          "factor": 1
        },
        {
          "target": "Door_Left_Panel",
          "factor": 0.5
        },
        {
          "target": "Door_Left_Panel_Tile_ppc",
          "factor": 0.5
        },
        {
          "target": "Door_Left_Panel_Tile_pmc",
          "factor": -0.5
        },
        {
          "target": "Door_Left_Panel_Tile_mpc",
          "factor": 0.5
        },
        {
          "target": "Door_Left_Panel_Tile_mmc",
          "factor": -0.5
        },
        {
          "target": "Door_Left_Panel_Tile_cpc",
          "factor": 0.5
        },
        {
          "target": "Door_Left_Panel_Tile_cmc",
          "factor": -0.5
        },
        {
          "target": "Hinge_Left_02_Cup",
          "factor": 0.333333333333
        },
        {
          "target": "Hinge_Left_02_Plate",
          "factor": 0.333333333333
        },
        {
          "target": "Hinge_Left_03_Cup",
          "factor": 0.666666666667
        },
        {
          "target": "Hinge_Left_03_Plate",
          "factor": 0.666666666667
        },
        {
          "target": "Hinge_Left_04_Cup",
          "factor": 1
        },
        {
          "target": "Hinge_Left_04_Plate",
          "factor": 1
        },
        {
          "target": "PushLatch_Left_Assembly",
          "factor": 1
        },
        {
          "target": "Door_Right_Panel",
          "factor": 0.5
        },
        {
          "target": "Door_Right_Panel_Tile_ppc",
          "factor": 0.5
        },
        {
          "target": "Door_Right_Panel_Tile_pmc",
          "factor": -0.5
        },
        {
          "target": "Door_Right_Panel_Tile_mpc",
          "factor": 0.5
        },
        {
          "target": "Door_Right_Panel_Tile_mmc",
          "factor": -0.5
        },
        {
          "target": "Door_Right_Panel_Tile_cpc",
          "factor": 0.5
        },
        {
          "target": "Door_Right_Panel_Tile_cmc",
          "factor": -0.5
        },
        {
          "target": "Hinge_Right_02_Cup",
          "factor": 0.333333333333
        },
        {
          "target": "Hinge_Right_02_Plate",
          "factor": 0.333333333333
        },
        {
          "target": "Hinge_Right_03_Cup",
          "factor": 0.666666666667
        },
        {
          "target": "Hinge_Right_03_Plate",
          "factor": 0.666666666667
        },
        {
          "target": "Hinge_Right_04_Cup",
          "factor": 1
        },
        {
          "target": "Hinge_Right_04_Plate",
          "factor": 1
        },
        {
          "target": "PushLatch_Right_Assembly",
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
          "target": "Shelf_Lower_Tile_pcp",
          "factor": 0.5
        },
        {
          "target": "Shelf_Lower_Tile_pcc",
          "factor": 0.5
        },
        {
          "target": "Shelf_Lower_Tile_pcm",
          "factor": 0.5
        },
        {
          "target": "Shelf_Lower_Tile_mcm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Lower_Tile_mcc",
          "factor": -0.5
        },
        {
          "target": "Shelf_Lower_Tile_mcp",
          "factor": -0.5
        },
        {
          "target": "Shelf_Upper_Tile_pcp",
          "factor": 0.5
        },
        {
          "target": "Shelf_Upper_Tile_pcc",
          "factor": 0.5
        },
        {
          "target": "Shelf_Upper_Tile_pcm",
          "factor": 0.5
        },
        {
          "target": "Shelf_Upper_Tile_mcm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Upper_Tile_mcc",
          "factor": -0.5
        },
        {
          "target": "Shelf_Upper_Tile_mcp",
          "factor": -0.5
        },
        {
          "target": "Rear_Brace_Tile_ppc",
          "factor": 0.5
        },
        {
          "target": "Rear_Brace_Tile_pcc",
          "factor": 0.5
        },
        {
          "target": "Rear_Brace_Tile_pmc",
          "factor": 0.5
        },
        {
          "target": "Rear_Brace_Tile_mpc",
          "factor": -0.5
        },
        {
          "target": "Rear_Brace_Tile_mcc",
          "factor": -0.5
        },
        {
          "target": "Rear_Brace_Tile_mmc",
          "factor": -0.5
        },
        {
          "target": "ClothesRail_Socket_Left",
          "factor": -0.5
        },
        {
          "target": "ClothesRail_Socket_Right",
          "factor": 0.5
        },
        {
          "target": "Door_Left_Hinge",
          "factor": -0.5
        },
        {
          "target": "Door_Left_Panel",
          "factor": 0.25
        },
        {
          "target": "Door_Left_Panel_Tile_ppc",
          "factor": 0.25
        },
        {
          "target": "Door_Left_Panel_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Door_Left_Panel_Tile_pmc",
          "factor": 0.25
        },
        {
          "target": "Door_Left_Panel_Tile_mpc",
          "factor": -0.25
        },
        {
          "target": "Door_Left_Panel_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Door_Left_Panel_Tile_mmc",
          "factor": -0.25
        },
        {
          "target": "Hinge_Left_01_Plate",
          "factor": -0.5
        },
        {
          "target": "Hinge_Left_02_Plate",
          "factor": -0.5
        },
        {
          "target": "Hinge_Left_03_Plate",
          "factor": -0.5
        },
        {
          "target": "Hinge_Left_04_Plate",
          "factor": -0.5
        },
        {
          "target": "Door_Right_Hinge",
          "factor": 0.5
        },
        {
          "target": "Door_Right_Panel",
          "factor": -0.25
        },
        {
          "target": "Door_Right_Panel_Tile_ppc",
          "factor": 0.25
        },
        {
          "target": "Door_Right_Panel_Tile_pcc",
          "factor": 0.25
        },
        {
          "target": "Door_Right_Panel_Tile_pmc",
          "factor": 0.25
        },
        {
          "target": "Door_Right_Panel_Tile_mpc",
          "factor": -0.25
        },
        {
          "target": "Door_Right_Panel_Tile_mcc",
          "factor": -0.25
        },
        {
          "target": "Door_Right_Panel_Tile_mmc",
          "factor": -0.25
        },
        {
          "target": "Hinge_Right_01_Plate",
          "factor": 0.5
        },
        {
          "target": "Hinge_Right_02_Plate",
          "factor": 0.5
        },
        {
          "target": "Hinge_Right_03_Plate",
          "factor": 0.5
        },
        {
          "target": "Hinge_Right_04_Plate",
          "factor": 0.5
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
          "target": "Panel_Back",
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
          "target": "Shelf_Lower_Tile_pcp",
          "factor": 0.5
        },
        {
          "target": "Shelf_Lower_Tile_pcm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Lower_Tile_mcm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Lower_Tile_mcp",
          "factor": 0.5
        },
        {
          "target": "Shelf_Lower_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Lower_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Shelf_Upper_Tile_pcp",
          "factor": 0.5
        },
        {
          "target": "Shelf_Upper_Tile_pcm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Upper_Tile_mcm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Upper_Tile_mcp",
          "factor": 0.5
        },
        {
          "target": "Shelf_Upper_Tile_ccm",
          "factor": -0.5
        },
        {
          "target": "Shelf_Upper_Tile_ccp",
          "factor": 0.5
        },
        {
          "target": "Rear_Brace",
          "factor": -0.5
        },
        {
          "target": "Door_Left_Hinge",
          "factor": 0.5
        },
        {
          "target": "Hinge_Left_01_Plate",
          "factor": 0.5
        },
        {
          "target": "Hinge_Left_02_Plate",
          "factor": 0.5
        },
        {
          "target": "Hinge_Left_03_Plate",
          "factor": 0.5
        },
        {
          "target": "Hinge_Left_04_Plate",
          "factor": 0.5
        },
        {
          "target": "PushLatch_Left_Assembly",
          "factor": 0.5
        },
        {
          "target": "Door_Right_Hinge",
          "factor": 0.5
        },
        {
          "target": "Hinge_Right_01_Plate",
          "factor": 0.5
        },
        {
          "target": "Hinge_Right_02_Plate",
          "factor": 0.5
        },
        {
          "target": "Hinge_Right_03_Plate",
          "factor": 0.5
        },
        {
          "target": "Hinge_Right_04_Plate",
          "factor": 0.5
        },
        {
          "target": "PushLatch_Right_Assembly",
          "factor": 0.5
        }
      ]
    }
  ],
  "textureAxes": {},
  "materialSlots": {
    "hardware": {
      "label": "Цвет фурнитуры",
      "targets": [
        "Hardware_Metal",
        "Hardware_Plastic"
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
    "Board_RearBrace_ppc_X",
    "Board_RearBrace_pcc_X",
    "Board_RearBrace_pmc_X",
    "Board_RearBrace_mpc_X",
    "Board_RearBrace_mcc_X",
    "Board_RearBrace_mmc_X",
    "Board_RearBrace_mpc_Y",
    "Board_RearBrace_cpc_Y",
    "Board_RearBrace_ppc_Y",
    "Board_RearBrace_mmc_Y",
    "Board_RearBrace_cmc_Y",
    "Board_RearBrace_pmc_Y",
    "Board_RearBrace_mpc_Z",
    "Board_RearBrace_cpc_Z",
    "Board_RearBrace_ppc_Z",
    "Board_RearBrace_mcc_Z",
    "Board_RearBrace_ccc_Z",
    "Board_RearBrace_pcc_Z",
    "Board_RearBrace_mmc_Z",
    "Board_RearBrace_cmc_Z",
    "Board_RearBrace_pmc_Z"
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
    "Front_Door_Tall_pmc_Z"
  ]
} as const

// Только material-review: позволяет проверить независимость slots с РЕАЛЬНЫМИ
// finish IDs каталога. Не обещает стабильный UV рисунка при resize.
export function createMaterialReviewDefinition(carcassFinish: string, frontsFinish: string, allowedFinishes: readonly string[]): FurnitureDefinition {
  for (const id of [carcassFinish, frontsFinish]) if (!allowedFinishes.includes(id)) throw new Error('Default finish must be allowed')
  return { ...WARDROBE_09_CONFIG, materialSlots: { ...WARDROBE_09_CONFIG.materialSlots,
    carcass: { label: 'Корпус и полки', targets: BOARD_MATERIAL_TARGETS.carcass, defaultFinish: carcassFinish, allowedFinishes },
    fronts: { label: 'Фасады', targets: BOARD_MATERIAL_TARGETS.fronts, defaultFinish: frontsFinish, allowedFinishes },
  } }
}
