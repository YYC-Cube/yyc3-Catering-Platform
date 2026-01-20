/**
 * @file NLPService.ts
 * @description YYC³餐饮行业智能化平台 - NLP服务类
 * @module services/NLPService
 * @author YYC³团队
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-12-29
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

export interface Intent {
  name: string;
  confidence: number;
  description: string;
}

export interface Entity {
  type: string;
  value: string;
  start: number;
  end: number;
  confidence: number;
}

export interface NLPResult {
  intent: Intent;
  entities: Entity[];
  confidence: number;
}

export interface NLPOptions {
  enableEntityExtraction?: boolean;
  enableIntentRecognition?: boolean;
  supportedIntents?: string[];
  supportedEntities?: string[];
}

export class NLPService {
  private options: NLPOptions;
  private intentPatterns: Map<string, RegExp[]>;
  private entityPatterns: Map<string, RegExp[]>;

  constructor(options: NLPOptions = {}) {
    this.options = {
      enableEntityExtraction: true,
      enableIntentRecognition: true,
      supportedIntents: [
        'order_food',
        'check_menu',
        'ask_opening_hours',
        'ask_promotions',
        'make_reservation',
        'ask_allergies',
        'ask_dietary',
        'ask_price',
        'cancel_order',
        'complain',
        'praise',
        'ask_recommendation',
        'check_order_status',
        'ask_location',
        'other'
      ],
      supportedEntities: [
        'food_item',
        'food_category',
        'quantity',
        'time',
        'date',
        'number',
        'allergen',
        'dietary_restriction',
        'price',
        'location'
      ],
      ...options
    };

    // 初始化意图模式
    this.intentPatterns = this.initializeIntentPatterns();
    // 初始化实体模式
    this.entityPatterns = this.initializeEntityPatterns();
  }

  /**
   * 初始化意图识别模式
   */
  private initializeIntentPatterns(): Map<string, RegExp[]> {
    const patterns = new Map<string, RegExp[]>();

    // 点餐意图
    patterns.set('order_food', [
      /(我要|我想|帮我)点(一份|一个|一些)?(.+)/i,
      /(来|上)(一份|一个|一些)?(.+)/i,
      /(我要|我想|帮我)订(一份|一个|一些)?(.+)/i,
      /(我要|我想|帮我)买(一份|一个|一些)?(.+)/i,
      /(点餐|下单|订购)/i,
      // 增强模式：支持"我要一份X"等表达
      /(我要|我想|帮我)(一份|一个|一些|碗|盘|杯|瓶)?(.+)/i,
      // 支持直接点餐：如"一份宫保鸡丁"
      /^(一|二|三|四|五|六|七|八|九|十|\d+)(份|个|只|条|碗|盘|杯|瓶)?(.+)/i,
      // 支持"给我来X"等表达
      /(给我)(来|要|吃)?(一份|一个|一些|碗|盘|杯|瓶)?(.+)/i
    ]);

    // 查看菜单意图
    patterns.set('check_menu', [
      /(菜单|有什么菜|有什么吃的|有什么推荐|看菜单)/i,
      /(有哪些|有什么)(菜品|菜色|食物|东西)/i,
      /(推荐|介绍)一下(你们的)?(菜品|菜色|食物|东西)/i
    ]);

    // 询问营业时间意图
    patterns.set('ask_opening_hours', [
      /(什么时候|几点)(开门|营业|关门|打烊)/i,
      /(营业时间|开放时间|关门时间|打烊时间)/i,
      /(现在|当前)(开着吗|营业吗|关门了吗|打烊了吗)/i
    ]);

    // 询问优惠活动意图
    patterns.set('ask_promotions', [
      /(优惠|活动|折扣|促销|特价)(是什么|有什么|有哪些)/i,
      /(有没有|有什么)(优惠|活动|折扣|促销|特价)/i,
      /(现在|当前)(有什么|是什么)(优惠|活动|折扣|促销|特价)/i
    ]);

    // 预订意图
    patterns.set('make_reservation', [
      /(预订|预约|订)(位置|座位|桌|包厢)/i,
      /(我想|帮我)(预订|预约|订)(位置|座位|桌|包厢)/i,
      /(有没有|有)(位置|座位|桌|包厢)/i
    ]);

    // 询问过敏信息意图
    patterns.set('ask_allergies', [
      /(过敏|过敏原|含有什么)(食物|成分|东西)/i,
      /(有没有|含不含)(过敏|过敏原|坚果|花生|海鲜|牛奶|鸡蛋)/i,
      /(.+)里有(过敏|过敏原|坚果|花生|海鲜|牛奶|鸡蛋)吗/i
    ]);

    // 询问饮食信息意图
    patterns.set('ask_dietary', [
      /(素食|清真|无麸质|低糖|低脂|减肥)(的)?(食物|菜品|东西)/i,
      /(有没有|有)(素食|清真|无麸质|低糖|低脂|减肥)(的)?(食物|菜品|东西)/i,
      /(.+)是(素食|清真|无麸质|低糖|低脂|减肥)的吗/i
    ]);

    // 询问价格意图
    patterns.set('ask_price', [
      /(.+)多少钱|(.+)的价格/i,
      /(价格|多少钱)(是多少|怎么样)(.+)吗?/i
    ]);

    // 取消订单意图
    patterns.set('cancel_order', [
      /(取消|撤销)(订单|我的订单)/i,
      /(我想|帮我)(取消|撤销)(订单|我的订单)/i
    ]);

    // 投诉意图
    patterns.set('complain', [
      /(投诉|抱怨|不满|不好|太差)(.+)/i,
      /(我要|我想)(投诉|抱怨)(.+)/i
    ]);

    // 表扬意图
    patterns.set('praise', [
      /(好吃|不错|很好|太棒了|优秀|表扬)(.+)/i,
      /(赞|好)(.+)/i
    ]);

    // 询问推荐意图
    patterns.set('ask_recommendation', [
      /(推荐|介绍)一下(你们的)?(招牌菜|特色菜|好吃的|热门的)(.+)?/i,
      /(什么|哪道)(菜|东西)(好吃|推荐|热门)/i
    ]);

    // 查看订单状态意图
    patterns.set('check_order_status', [
      /(我的订单|订单)怎么样了|(我的订单|订单)的状态/i,
      /(查看|查询)(我的订单|订单)的状态/i,
      /(我的订单|订单)做好了吗|(我的订单|订单)准备好了吗/i
    ]);

    // 询问位置意图
    patterns.set('ask_location', [
      /(你们的|餐厅的)(位置|地址)(在哪里|是什么)/i,
      /(地址|位置)(是多少|怎么样|在哪里)/i
    ]);

    return patterns;
  }

  /**
   * 初始化实体提取模式
   */
  private initializeEntityPatterns(): Map<string, RegExp[]> {
    const patterns = new Map<string, RegExp[]>();

    // 食物项目实体 - 这里使用全局标志g以便多次匹配
    patterns.set('food_item', [
      /(红烧肉|清蒸鱼|宫保鸡丁|麻婆豆腐|鱼香肉丝|水煮鱼|糖醋里脊|烤鸭|火锅|面条|米饭|饺子|包子)/gi
    ]);

    // 食物类别实体
    patterns.set('food_category', [
      /(招牌菜|特色菜|凉菜|热菜|主食|汤品|甜品|饮料|酒水|小吃)/gi
    ]);

    // 数量实体
    patterns.set('quantity', [
      /(一|二|三|四|五|六|七|八|九|十|百|千|万|亿|零|壹|贰|叁|肆|伍|陆|柒|捌|玖|拾|佰|仟|万|亿)(个|份|只|条|碗|盘|杯|瓶)?/gi,
      /(\d+)(个|份|只|条|碗|盘|杯|瓶)?/gi
    ]);

    // 时间实体
    patterns.set('time', [
      /(\d+):(\d+)(上午|下午|晚上|AM|PM)?/gi,
      /(\d+)点(\d+)?(分)?(上午|下午|晚上|AM|PM)?/gi,
      /(早上|上午|中午|下午|晚上|凌晨)(\d+)?点(\d+)?(分)?/gi
    ]);

    // 日期实体
    patterns.set('date', [
      /(\d{4})-(\d{2})-(\d{2})/gi,
      /(\d{2})\/(\d{2})\/(\d{4})/gi,
      /(明天|后天|今天|昨天|本周|下周|上个月|下个月|今年|明年)(\d+)?(号|日)?/gi
    ]);

    // 数字实体
    patterns.set('number', [
      /\d+/gi,
      /(一|二|三|四|五|六|七|八|九|十|百|千|万|亿|零|壹|贰|叁|肆|伍|陆|柒|捌|玖|拾|佰|仟|万|亿)/gi
    ]);

    // 过敏原实体
    patterns.set('allergen', [
      /(坚果|花生|海鲜|虾|蟹|贝类|牛奶|鸡蛋|小麦|大豆|麸质|芝麻|鱼|蜂蜜)/gi
    ]);

    // 饮食限制实体
    patterns.set('dietary_restriction', [
      /(素食|纯素|清真|无麸质|低糖|低脂|低卡路里|减肥|糖尿病|高血压|高血脂)/gi
    ]);

    // 价格实体
    patterns.set('price', [
      /(\d+)(\.\d+)?(元|块|角|分)/gi,
      /¥(\d+)(\.\d+)?/gi,
      /\$(\d+)(\.\d+)?/gi
    ]);

    // 位置实体
    patterns.set('location', [
      /(地址|位置|在哪里|怎么走|路线)(.+)/gi
    ]);

    return patterns;
  }

  /**
   * 识别用户意图
   */
  async recognizeIntent(text: string): Promise<Intent> {
    if (!this.options.enableIntentRecognition) {
      return {
        name: 'other',
        confidence: 1.0,
        description: '默认意图'
      };
    }

    // 遍历所有意图模式，寻找最佳匹配
    let bestIntent: Intent = {
      name: 'other',
      confidence: 0.0,
      description: '其他意图'
    };

    for (const [intentName, patterns] of this.intentPatterns.entries()) {
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          // 计算匹配置信度
          const confidence = this.calculateIntentConfidence(match, text, intentName);
          
          if (confidence > bestIntent.confidence) {
            bestIntent = {
              name: intentName,
              confidence,
              description: this.getIntentDescription(intentName)
            };
          }
        }
      }
    }

    // 如果置信度太低，返回其他意图
    if (bestIntent.confidence < 0.3) {
      bestIntent.name = 'other';
      bestIntent.confidence = 1.0 - bestIntent.confidence;
      bestIntent.description = '其他意图';
    }

    return bestIntent;
  }

  /**
   * 提取文本中的实体
   */
  async extractEntities(text: string): Promise<Entity[]> {
    if (!this.options.enableEntityExtraction) {
      return [];
    }

    const entities: Entity[] = [];

    // 遍历所有实体模式
    for (const [entityType, patterns] of this.entityPatterns.entries()) {
      for (const pattern of patterns) {
        try {
          // 重置lastIndex以确保每次都从文本开头开始匹配
          pattern.lastIndex = 0;
          
          let match;
          
          // 使用exec()方法查找所有匹配项
          while ((match = pattern.exec(text)) !== null) {
            // 检查是否已经提取过这个实体
            const alreadyExists = entities.some(entity => 
              entity.start === match.index && 
              entity.end === match.index + match[0].length
            );
            
            if (!alreadyExists) {
              entities.push({
                type: entityType,
                value: match[0],
                start: match.index,
                end: match.index + match[0].length,
                confidence: this.calculateEntityConfidence(match, text, entityType)
              });
            }
            
            // 防止无限循环 - 如果匹配的是空字符串，手动推进索引
            if (match.index === pattern.lastIndex) {
              pattern.lastIndex++;
            }
          }
        } catch (error) {
          console.error(`实体提取错误 - ${entityType}:`, error);
        }
      }
    }

    return entities;
  }

  /**
   * 综合处理文本，识别意图和提取实体
   */
  async processText(text: string): Promise<NLPResult> {
    const intent = await this.recognizeIntent(text);
    const entities = await this.extractEntities(text);
    
    // 计算整体置信度
    const entityConfidence = entities.length > 0 
      ? entities.reduce((sum, entity) => sum + entity.confidence, 0) / entities.length 
      : 0.5;
    
    const overallConfidence = (intent.confidence * 0.7) + (entityConfidence * 0.3);

    return {
      intent,
      entities,
      confidence: overallConfidence
    };
  }

  /**
   * 计算意图置信度
   */
  private calculateIntentConfidence(match: RegExpMatchArray, text: string, intentName: string): number {
    // 基础置信度
    let confidence = 0.5;
    
    // 根据匹配长度调整置信度
    const matchLength = match[0].length;
    const textLength = text.length;
    const matchRatio = matchLength / textLength;
    
    confidence += matchRatio * 0.3;
    
    // 根据意图类型调整置信度
    const intentConfidenceBoost: Record<string, number> = {
      'order_food': 0.1,
      'check_menu': 0.1,
      'ask_opening_hours': 0.1,
      'ask_promotions': 0.1,
      'make_reservation': 0.1
    };
    
    if (intentConfidenceBoost[intentName]) {
      confidence += intentConfidenceBoost[intentName];
    }
    
    // 限制置信度在0-1之间
    return Math.min(Math.max(confidence, 0), 1);
  }

  /**
   * 计算实体置信度
   */
  private calculateEntityConfidence(match: RegExpMatchArray, text: string, entityType: string): number {
    // 基础置信度
    let confidence = 0.7;
    
    // 根据实体类型调整置信度
    const entityConfidenceBoost: Record<string, number> = {
      'food_item': 0.2,
      'quantity': 0.2,
      'time': 0.2,
      'date': 0.2,
      'price': 0.2
    };
    
    if (entityConfidenceBoost[entityType]) {
      confidence += entityConfidenceBoost[entityType];
    }
    
    // 限制置信度在0-1之间
    return Math.min(Math.max(confidence, 0), 1);
  }

  /**
   * 获取意图描述
   */
  private getIntentDescription(intentName: string): string {
    const descriptions: Record<string, string> = {
      'order_food': '点餐意图',
      'check_menu': '查看菜单意图',
      'ask_opening_hours': '询问营业时间意图',
      'ask_promotions': '询问优惠活动意图',
      'make_reservation': '预订意图',
      'ask_allergies': '询问过敏信息意图',
      'ask_dietary': '询问饮食信息意图',
      'ask_price': '询问价格意图',
      'cancel_order': '取消订单意图',
      'complain': '投诉意图',
      'praise': '表扬意图',
      'ask_recommendation': '询问推荐意图',
      'check_order_status': '查看订单状态意图',
      'ask_location': '询问位置意图',
      'other': '其他意图'
    };
    
    return descriptions[intentName] || '未知意图';
  }

  /**
   * 更新NLP配置
   */
  updateConfig(config: Partial<NLPOptions>): void {
    this.options = { ...this.options, ...config };
  }

  /**
   * 获取NLP服务状态
   */
  getStatus(): {
    isActive: boolean;
    supportedIntents: string[];
    supportedEntities: string[];
    enabledFeatures: string[];
  } {
    const enabledFeatures: string[] = [];
    
    if (this.options.enableIntentRecognition) {
      enabledFeatures.push('intent_recognition');
    }
    
    if (this.options.enableEntityExtraction) {
      enabledFeatures.push('entity_extraction');
    }
    
    return {
      isActive: true,
      supportedIntents: this.options.supportedIntents || [],
      supportedEntities: this.options.supportedEntities || [],
      enabledFeatures
    };
  }
}