package com.intelligenthub.controller;

import com.intelligenthub.dto.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/knowledge-graph")
public class KnowledgeGraphController {

    /**
     * 查询菜品关联关系
     */
    @GetMapping("/dishes/{dishId}/relations")
    public ApiResponse<List<GraphRelationDTO>> getDishRelations(
        @PathVariable String dishId,
        @RequestParam(required = false) Integer depth) {
        // 实现逻辑
        return null;
    }

    /**
     * 智能菜品搭配推荐
     */
    @PostMapping("/dishes/{dishId}/pairings")
    public ApiResponse<List<DishPairingDTO>> getDishPairings(
        @PathVariable String dishId,
        @RequestBody PairingContext context) {
        // 实现逻辑
        return null;
    }
}