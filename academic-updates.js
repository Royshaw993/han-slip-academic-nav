/*
 * 汉代简牍最新学术动态数据
 * 这里只维护学术动态内容，不修改页面逻辑。
 *
 * 数据维护说明：
 * 1. 不允许虚构论文标题、作者、会议、日期、期刊、出版社、机构或网址。
 * 2. 每条学术动态必须能够追溯到可靠来源。
 * 3. 来源优先使用正式学术期刊、大学研究中心、高校官网、出版社、考古研究机构、博物馆、正式数据库。
 * 4. sourceUrl 必须尽量使用 HTTPS。
 * 5. id 必须唯一，不能与现有动态重复。
 * 6. title 不能为空。
 * 7. source 不能为空。
 * 8. date 尽量使用 YYYY-MM-DD；如果只能确认月份，可以使用 YYYY-MM。
 * 9. 每次新增、删除或修改真实动态后，都必须同步更新 academicUpdatesLastUpdated。
 * 10. type 只能优先使用当前已有标准类型：新论文、新书、新资料、学术会议、学术讲座、研究动态、数据库更新。
 * 11. topics 用于研究对象筛选，优先使用标准名称：居延汉简、悬泉汉简、敦煌汉简、肩水金关、武威汉简、张家山汉简、五一广场东汉简、走马楼西汉简。
 * 12. 如果某条动态同时涉及多个研究对象，可以在 topics 中写入多个标准名称。
 * 13. tags 可以用于补充更细的研究关键词，如释文、字形、缀合、法律、行政、书写、简牍整理、数字人文、AI 等。
 *
 * 新增学术动态模板
 * 使用说明：
 * 新增真实学术动态时，可以复制下面对象，填写真实、可核验的信息后加入 academicUpdates 数组。
 * 模板字段请保持与当前数据结构一致。
 *
 * {
 *   id: "",
 *   title: "",
 *   type: "新论文",
 *   date: "YYYY-MM-DD",
 *   source: "",
 *   sourceUrl: "https://",
 *   summary: "",
 *   tags: [],
 *   featured: false,
 *   relatedResources: []
 * }
 *
 * 每次新增、删除或修改真实学术动态后，请同步更新 academicUpdatesLastUpdated。
 */
window.academicUpdatesLastUpdated = "2026-08-20";
window.academicUpdates = [
  { id:"bsm-xuanquan-80", title:"姚磊：读《悬泉汉简》札记（八十）", type:"新论文", source:"武汉大学简帛网", sourceUrl:"https://www.bsm.org.cn/?hanjian/10147.html", date:"2026-08-11", summary:"简帛网汉简栏目发布的最新札记之一，围绕《悬泉汉简》材料展开释读与讨论。", tags:["悬泉汉简","释文","汉简"], featured:true, relatedResources:["简帛网","简牍学术资源数据共享平台"] },
  { id:"bsm-jinguan-202608", title:"张俊民：金关汉简释文校释二则", type:"新论文", source:"武汉大学简帛网", sourceUrl:"https://www.bsm.org.cn/?hanjian/10140.html", date:"2026-08-01", summary:"聚焦肩水金关汉简释文校勘的研究札记，属于简帛网汉简栏目的近期成果。", tags:["肩水金关","释文","校释"], featured:true, relatedResources:["简帛网","简牍字典"] },
  { id:"tsinghua-gujianxinyi", title:"程浩：《古简新义：清华简的文字与文本研究》", type:"新书", source:"清华大学出土文献研究与保护中心", sourceUrl:"https://www.ctwx.tsinghua.edu.cn/info/1072/3522.htm", date:"2026-08-14", summary:"中心发布的新书信息；该书汇集作者在清华简文字释读、文本研究及相关出土文献校读考辨方面的成果。", tags:["新书","清华简","文字释读","文本研究"], featured:true, relatedResources:["清华大学出土文献研究与保护中心"] },
  { id:"tsinghua-journal-2026-2", title:"《出土文献》2026年第2期", type:"新论文", source:"清华大学出土文献研究与保护中心", sourceUrl:"https://www.ctwx.tsinghua.edu.cn/info/1093/3513.htm", date:"2026-06-15", summary:"本期目录包含西北屯戍汉简字词考释、悬泉汉简车马器考释等秦汉简牍研究成果。", tags:["西北汉简","悬泉汉简","字词考释","期刊"], featured:false, relatedResources:["清华大学出土文献研究与保护中心"] },
  { id:"tsinghua-graduate-forum-2026", title:"第一届古文字与出土文献研究生论坛征稿", type:"学术会议", source:"清华大学出土文献研究与保护中心", sourceUrl:"https://www.ctwx.tsinghua.edu.cn/info/1068/3496.htm", date:"2026-10-24 至 10-25", summary:"论坛将在清华大学举行，征稿主题包括甲骨、金文、战国文字、秦汉简牍及先秦秦汉史研究。", tags:["学术会议","秦汉简牍","古文字","出土文献"], featured:true, relatedResources:["清华大学出土文献研究与保护中心"] },
  { id:"nanduxuetan-zoumalou-2026", title:"袁延胜、贾蕾：走马楼西汉简“驾、纵、野劾不审案”所见汉代司法问题", type:"新论文", source:"《南都学坛》2026年第1期", sourceUrl:"https://ldxt.cbpt.cnki.net/portal/journal/portal/client/paper/48027c5f53c79bdcb7eae29d917d4a0c", date:"2026-01-10", summary:"文章以走马楼西汉简所载司法案例为中心，讨论诈为券书、劾不审与相关官吏责任，呈现西汉前期司法程序。", tags:["走马楼西汉简","司法文书","汉代法律","新论文"], featured:true, relatedResources:["中国知网","简帛网"] },
  { id:"nwnu-deepjiandu", title:"简牍文字数据集 DeepJiandu 正式公开使用", type:"数据库更新", source:"西北师范大学简牍学术资源数据共享平台", sourceUrl:"https://jiandu.nwnu.edu.cn/article/229.html", date:"2025-03-28", summary:"DeepJiandu 面向简牍字符检测与识别，公开7416张红外图像及相应字符标注，用于OCR、字符识别等数字人文研究。", tags:["DeepJiandu","数字人文","AI","图像","字符识别"], featured:true, relatedResources:["简牍学术资源数据共享平台"] },
  { id:"ruc-zhangjiashan-daozhi-2025", title:"曹建国：早期书写与文本传统——以张家山汉简《盗跖》为例", type:"新论文", source:"《中国人民大学学报》2025年第4期", sourceUrl:"https://xuebao.ruc.edu.cn/CN/Y2025/V39/I4/150", date:"2025-07-16", summary:"论文以张家山汉简《盗跖》为中心，讨论早期文本的书写形态与文本传统，刊于《中国人民大学学报》第39卷第4期。", tags:["张家山汉简","盗跖","早期书写","文本传统"], featured:true, relatedResources:["简帛网","中国知网"] },
  { id:"tsinghua-wuyi-jiushi-2025", title:"《长沙五一广场东汉简牍（玖）（拾）》出版", type:"新书", source:"清华大学出土文献研究与保护中心", sourceUrl:"https://www.ctwx.tsinghua.edu.cn/info/1011/3277.htm", date:"2025-02-25", summary:"这两辑整理成果共收录五一广场井窖遗址出土简牍1100枚，包含彩色与红外图版、释文注释、编号尺寸对照表和异体字表。", tags:["五一广场东汉简","新整理材料","图版","释文","新书"], featured:true, relatedResources:["清华大学出土文献研究与保护中心","简牍学术资源数据共享平台"] },
  { id:"tsinghua-oxford-2026", title:"“出土简帛的文本与思想”国际学术研讨会在牛津召开", type:"研究动态", source:"清华大学出土文献研究与保护中心", sourceUrl:"https://www.ctwx.tsinghua.edu.cn/info/1072/3518.htm", date:"2026-07-04", summary:"清华大学与牛津大学相关研究中心联合举办，议题涵盖简帛整理释读、文本形成与早期中国文明研究。", tags:["出土简帛","国际会议","清华简","文本研究"], featured:false, relatedResources:["清华大学出土文献研究与保护中心"] },
  { id:"bsm-xuanquan-10135", title:"《悬泉汉简（贰）》校读札记一则", type:"新论文", source:"武汉大学简帛网", sourceUrl:"https://www.bsm.org.cn/?hanjian/10135.html", date:"2026-07-23", summary:"围绕《悬泉汉简（贰）》材料展开释读，讨论汉代行政文书、字形辨析及相关居延汉简辞例。", tags:["悬泉汉简","居延汉简","释文","字形","行政","汉代文书"], featured:true, relatedResources:["简帛网","简牍学术资源数据共享平台"] },
  { id:"zoumalou-biezhi-20260410", title:"走马楼西汉简“别治”机构考", type:"新论文", source:"《中国历史地理论丛》", sourceUrl:"https://zgld.cbpt.cnki.net/portal/journal/portal/client/paper/9d58e5e262f000f7ee8139514a8d1d78", date:"2026-04-10", summary:"利用走马楼西汉简讨论西汉长沙国别治机构的性质、层级及地方行政变迁。", tags:["走马楼西汉简","行政","制度史","地方治理","论文"], featured:true, relatedResources:["简帛网","中国知网"] },
  { id:"zhangjiashan-gushiqi-20250925", title:"张家山汉简《■谷食气》校读札记", type:"新论文", source:"《丝绸之路》", sourceUrl:"https://sczl.cbpt.cnki.net/portal/journal/portal/client/paper/656c4b4c69d3eeab6f9fa43e24e0e9fa", date:"2025-09-25", summary:"针对新公布的张家山汉简《■谷食气》进行字形、释文和疑难字词校读。", tags:["张家山汉简","释文","字形","校读","出土资料"], featured:true, relatedResources:["中国知网","简帛网"] },
  { id:"bsm-xuanquan-10144", title:"《悬泉汉简》读札两则（二）", type:"新论文", source:"武汉大学简帛网", sourceUrl:"https://www.bsm.org.cn/?hanjian/10144.html", date:"2026-08-05", summary:"简帛网汉简栏目发布的悬泉汉简研读成果，围绕简文释读与相关简帛材料展开讨论。", tags:["悬泉汉简","释文","研读","简帛研究"], featured:true, relatedResources:["简帛网","简牍字典"] },
  { id:"qinhan-zixingpu-20250523", title:"《秦汉简牍系列字形谱》", type:"新书", source:"昆明学院官方网站", sourceUrl:"https://www.kmu.edu.cn/info/1066/14513.htm", date:"2025-05-23", summary:"秦汉简牍文字字形谱系整理成果，涉及俗写字、字形研究及汉代简牍相关材料。", tags:["汉代简牍文字","字形","俗写字","秦汉简牍","字形谱"], featured:false, relatedResources:["小學堂文字學資料庫","字统网"] },
  { id:"xuanquan-conference-20240907", title:"消息丨第二届简牍学国际学术研讨会暨《悬泉汉简（肆）》新书首发仪式在敦煌举行", type:"学术会议", source:"西北师范大学简牍学术资源相关平台", sourceUrl:"https://jiandu.nwnu.edu.cn/article/198.html", date:"2024-09-07", summary:"第二届简牍学国际学术研讨会暨《悬泉汉简（肆）》新书首发活动，记录悬泉汉简整理与研究的重要学术动态。", tags:["悬泉汉简","简牍整理","学术会议","新书","出土资料"], featured:false, historical:true, relatedResources:["简牍学术资源数据共享平台","简帛网"] },
  { id:"zoumalou-book-20240904", title:"【书讯】陈松长主编：《长沙走马楼西汉简牍研究》", type:"新书", source:"西北师范大学简牍学术资源相关平台", sourceUrl:"https://jiandu.nwnu.edu.cn/article/194.html", date:"2024-09-04", summary:"走马楼西汉简牍专题研究著作书讯，为该批简牍的整理、释读与研究史提供重要参考。", tags:["走马楼西汉简","新书","简牍整理","研究史","地方文书"], featured:false, historical:true, relatedResources:["简帛网","简牍学术资源数据共享平台"] },
  { id:"xihan-overview-20240723", title:"【大敦煌·洞鉴】张德芳：西北汉简整理的历史回顾及其启示", type:"研究动态", source:"西北师范大学简牍学术资源相关平台", sourceUrl:"https://jiandu.nwnu.edu.cn/article/175.html", date:"2024-07-23", summary:"回顾西北汉简整理工作的历史进程并总结相关启示，适合作为汉简资料学与研究史的参考。", tags:["西北汉简","简牍整理","研究史","综述","敦煌"], featured:false, historical:true, relatedResources:["简牍学术资源数据共享平台","简帛网"] },
  { id:"jingshui-group-20240719", title:"汪受宽：肩水金关汉简“黑色”人群体研究", type:"新论文", source:"西北师范大学简牍学术资源相关平台", sourceUrl:"https://jiandu.nwnu.edu.cn/article/171.html", date:"2024-07-19", summary:"以肩水金关汉简为材料讨论“黑色”人群体问题，补充汉简社会史与人群研究视角。", tags:["肩水金关","社会史","人群研究","汉简","出土文书"], featured:false, historical:true, relatedResources:["简牍学术资源数据共享平台","简牍字典"] }
];
