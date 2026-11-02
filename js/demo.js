/**
 * 示範模式腳本 — 無 API Key 時可走完開場與多幕，並導向多結局傾向
 */
const SCENES = {
  wake: {
    narrative:
      "雞啼未歇，你從破驛的土炕上掙開眼。頭顱隱隱作痛，像有人用鐵錘敲過。窗外晨霧未散，远处田壟隱約可見。\n\n你不知自己是誰。囊中只有幾枚半兩錢，衣襟縫著一塊磨損的玉佩碎片——觸之微涼，心底卻湧起無名的孤獨，與一句說不出來的「天下」。\n\n驛卒在院中劈柴，瞥了你一眼：「醒啦？昨日抬你回來時，渾身泥水，口中念念有詞……說什麼『律令』『咸陽』。你到底是哪路人？」",
    choices: [
      { id: "ask_where", text: "強作鎮定，問此處是何處" },
      { id: "check_body", text: "不答，先檢查自身傷勢與身邊之物" },
      { id: "leave_quiet", text: "沉默起身，想趁亂離開驛站" },
    ],
    stateDelta: { flags: { woke: true }, energy: -2 },
    memoryHints: ["玉佩碎片觸手微涼", "殘留字眼：天下、律令、咸陽"],
  },

  ask_where: {
    narrative:
      "「此乃咸陽郊外的青禾驛。往北半日是京畿官道，往南是幾個小村。」驛卒擦汗，「你若無憑無據，莫往官道擠——近日巡邏緊，說是要查『失蹤貴人』。」\n\n你心頭一跳，卻說不清為何。",
    choices: [
      { id: "ask_missing", text: "追問：失蹤貴人？是何人？" },
      { id: "to_village", text: "道謝，往南村去尋食宿" },
      { id: "rest_more", text: "再歇一時，養足力氣" },
    ],
    stateDelta: { identityHint: 3, hour: 1 },
  },

  check_body: {
    narrative:
      "肋下青紫，像被人拖拽過。腕上無鐐銬痕跡，指繭卻不像農夫。玉佩碎片刻著半個殘缺的「政」字——你盯著它，腦海空白，只餘耳鳴。\n\n驛卒嘀咕：「你這手……不像種田的。」",
    choices: [
      { id: "ask_where", text: "若無其事地打聽此地消息" },
      { id: "hide_jade", text: "把玉佩藏進衣內，表示要去村中打工換糧" },
      { id: "to_village", text: "轉身南行，避開驛卒視線" },
    ],
    stateDelta: {
      identityHint: 5,
      addMemories: [
        {
          id: "jade_zheng",
          title: "殘玉·政",
          text: "玉佩碎片上有半個『政』字。你不知它為何令你心跳加速。",
        },
      ],
    },
    memoryHints: ["殘玉上的『政』字"],
  },

  leave_quiet: {
    narrative:
      "你悄然出門。晨露打濕布鞋。官道遠處有馬蹄聲，你本能地躲進田埂。一隊黑衣騎從飛馳而過，旗幟模糊，卻令你脊背發寒。\n\n你寧願往南，往炊煙處去。",
    choices: [
      { id: "to_village", text: "循炊煙前往村落" },
      { id: "follow_road_far", text: "遠遠跟著官道，觀察騎從去向" },
    ],
    stateDelta: { energy: -5, courtThreat: 2, hour: 1, location: "田壟小徑", locationId: "fields" },
  },

  ask_missing: {
    narrative:
      "驛卒搖頭：「聽說宮裡亂，咸陽城門盤查嚴。我一介草民，不敢多嘴。你若真失憶，少提『貴人』二字，保命要緊。」\n\n他塞給你半塊乾糧：「算我行善。」",
    choices: [
      { id: "to_village", text: "收下乾糧，往村中去" },
      { id: "offer_help", text: "提出幫驛站打雜，換一夜安穩" },
    ],
    stateDelta: { grain: 1, renown: 1, identityHint: 4, courtThreat: 1 },
  },

  rest_more: {
    narrative:
      "你閉目躺回土炕。夢裡有金殿、有長劍、有無盡的奏章與孤獨。醒來時日已近午，驛卒在喊：「要走就走，莫白占床位！」",
    choices: [
      { id: "to_village", text: "起身離去，往村落" },
      { id: "offer_help", text: "願意幹活抵宿費" },
    ],
    stateDelta: { energy: 15, hp: 5, hour: 4, addMemories: [{ id: "dream_hall", title: "夢·金殿", text: "夢中金殿森嚴，你立於高處，卻無人可語。" }] },
    memoryHints: ["金殿之夢"],
  },

  hide_jade: {
    narrative:
      "你把殘玉貼胸藏好，對驛卒道：「我會劈柴、會識字——若用得著。」他眼睛一亮：「識字？正好，隔壁村塾缺人抄書。先去青禾村看看吧。」",
    choices: [
      { id: "to_village", text: "前往青禾村" },
      { id: "offer_help", text: "先在驛站幹半天再走" },
    ],
    stateDelta: { renown: 2, identityHint: 2 },
  },

  offer_help: {
    narrative:
      "半日劈柴挑水，肩酸手裂，卻奇異地覺得踏實。驛卒對你態度軟了些，晚上給你一碗黍粥，並悄悄說：「村東頭寡婦劉嫂善心，或許肯留你。」\n\n夜色中，你聽見官道又有馬蹄。",
    choices: [
      { id: "to_village", text: "次日清晨赴青禾村" },
      { id: "listen_night", text: "夜間潛出，偷聽巡邏對話" },
    ],
    stateDelta: {
      flags: { met_innkeeper: true },
      energy: -10,
      hp: -3,
      grain: 1,
      renown: 3,
      day: 1,
      hour: 14,
      location: "青禾驛",
      locationId: "post_station",
    },
  },

  listen_night: {
    narrative:
      "黑暗裡，兩騎停在驛外。一人低聲：「大王……不，主上失蹤已三日。丞相下令封鎖消息，對外只說『貴人巡狩』。若有可疑之人，即刻押回……」\n\n另一人：「有人說新君登基未穩，或有人……」話未完便被喝止。\n\n你藏在柴堆後，掌心全是汗。『主上』二字如雷。",
    choices: [
      { id: "to_village", text: "天亮後低調入村，隱姓埋名" },
      { id: "seek_truth", text: "決意查明『主上失蹤』與自己的關係" },
    ],
    stateDelta: {
      identityHint: 12,
      courtThreat: 8,
      energy: -8,
      addMemories: [
        {
          id: "patrol_whisper",
          title: "夜語·主上",
          text: "巡邏私語：主上失蹤三日，對外稱貴人巡狩。新君登基未穩。",
        },
      ],
    },
    memoryHints: ["主上失蹤", "新君登基未穩"],
  },

  follow_road_far: {
    narrative:
      "你隔著距離跟了一陣。騎從進入關卡盤查商旅，翻箱倒籠。你不敢近，折回南途——腹中飢鳴，必須先求一餐。",
    choices: [{ id: "to_village", text: "折往青禾村" }],
    stateDelta: { energy: -8, courtThreat: 5, hour: 2 },
  },

  to_village: {
    narrative:
      "青禾村不大，土牆茅簷，村口老槐下有孩童追逐。一位衣衫補丁的婦人（劉嫂）正在曬穀，見你衣履狼狽，先皺眉，又叹气：「又一個逃荒的？……罷，先喝碗湯。」\n\n村中張貼著褪色告示：徵役、糧賦、與一則「尋人」——字跡被雨洇得只剩「贏」字的半邊。",
    choices: [
      { id: "help_liu", text: "幫忙曬穀、搬糧，換宿" },
      { id: "read_notice", text: "湊近端詳村口告示" },
      { id: "talk_kids", text: "與孩童閒談，打聽村中傳聞" },
    ],
    stateDelta: {
      location: "青禾村",
      locationId: "qinghe_village",
      sceneId: "village",
      hour: 2,
      energy: -5,
    },
  },

  help_liu: {
    narrative:
      "你幹活利落得出奇——指揮、分配、計數，皆似本能。劉嫂愣住：「你……以前管過莊子？」\n\n你搖頭。她不再追問，夜里讓你睡柴房，並說村西有位落魄書生，愛喝醉罵秦法嚴苛。",
    choices: [
      { id: "meet_scholar", text: "次日去尋那位書生" },
      { id: "read_notice", text: "再去看村口告示" },
      { id: "orphan_plot", text: "聽聞村裡孤兒被里正欺壓，想去看看" },
    ],
    stateDelta: {
      flags: { met_innkeeper: true },
      renown: 5,
      energy: -12,
      grain: 1,
      day: 1,
      identityHint: 4,
      addMemories: [{ id: "instinct_order", title: "本能·秩序", text: "你安排農活如臂使指，彷彿天生懂得『律令』與『組織』。" }],
    },
  },

  read_notice: {
    narrative:
      "告示一：加徵口賦。告示二：嚴禁私藏兵器。告示三，半殘：『……尋……政……重賞……』你指尖發顫。旁有老人啐道：「當今新君剛登位，宮裡就亂成一鍋粥，還來折騰咱們。」\n\n『政』字再次刺痛你。",
    choices: [
      { id: "help_liu", text: "先求安穩，幫劉嫂換宿" },
      { id: "meet_scholar", text: "找書生詢問『新君』與『尋人』之事" },
      { id: "seek_truth", text: "暗記告示，決心查下去" },
    ],
    stateDelta: {
      flags: { saw_edict: true },
      identityHint: 10,
      courtThreat: 3,
      addMemories: [{ id: "notice_zheng", title: "告示·政", text: "村口尋人告示殘字有『政』，並言及新君登位未穩。" }],
    },
    memoryHints: ["尋人告示的『政』"],
  },

  talk_kids: {
    narrative:
      "孩童們笑你「官腔怪」：說話端著，卻穿得破。一個女孩說夜里夢見「穿黑衣的王」站在田裏哭。另一個男孩模仿衙役喊：「抓住那個失蹤的——」\n\n你喉嚨發緊，塞給他們一枚半兩錢。",
    choices: [
      { id: "help_liu", text: "去幫劉嫂" },
      { id: "orphan_plot", text: "跟著女孩去看孤兒阿石" },
      { id: "read_notice", text: "轉去看告示" },
    ],
    stateDelta: { coin: -1, renown: 2, identityHint: 6 },
  },

  orphan_plot: {
    narrative:
      "阿石不過十歲，父親死於徭役，里正要收走他家僅剩的豕。你上前理論——話出口，竟引經據典，句句切中律意。里正色變：「你這傢伙……是官府的人？」\n\n圍觀村民竊竊私語。你救下了豕，也把自己暴露在目光裡。",
    choices: [
      { id: "meet_scholar", text: "離開人群，去找書生聊聊律法" },
      { id: "low_profile", text: "立刻低調，表示只是路人多嘴" },
      { id: "reform_seed", text: "趁機向村民說：法當為民，不當虐民" },
    ],
    stateDelta: {
      flags: { helped_orphan: true },
      renown: 12,
      courtThreat: 6,
      identityHint: 8,
      energy: -6,
      addMemories: [{ id: "law_instinct", title: "律意本能", text: "面對里正，你脫口而出的律條令自己都陌生。" }],
    },
  },

  low_profile: {
    narrative:
      "你拱手退開，連稱「多嘴」。里正哼了一聲離去。劉嫂拉你到一旁：「好心是好，可你那張嘴太像官。想活命，就在村裡老實待著。」",
    choices: [
      { id: "quiet_path", text: "答應隱居務農，不問外事" },
      { id: "meet_scholar", text: "仍想找書生問個明白" },
    ],
    stateDelta: { renown: 3, courtThreat: -2, flags: { quiet_life: false } },
  },

  reform_seed: {
    narrative:
      "幾句話在村中傳開。有人點頭，有人懼怕。書生聞訊找來，眼睛發亮：「先生若有心，可與我草擬『寬賦減役』之議，聯名呈縣……當然，也可能殺身。」",
    choices: [
      { id: "reform_path", text: "願意試一試，以民間之力改苛政" },
      { id: "seek_truth", text: "改革之前，先弄清自己是誰" },
      { id: "quiet_path", text: "退卻：太險，不如低調過活" },
    ],
    stateDelta: { renown: 8, flags: { spoke_scholar: true }, identityHint: 5 },
  },

  meet_scholar: {
    narrative:
      "書生姓陳，名微，醉眼朦朧：「秦法如鐵，民如草芥。新君贏政，年少剛愎，人頭會落地……你若識字，可助我抄《詩》，換幾升米。」\n\n他突然盯著你的眉眼：「奇怪……你有點像城門畫影上的——算了，醉話。」",
    choices: [
      { id: "copy_books", text: "留下抄書換糧" },
      { id: "ask_yingzheng", text: "追問：贏政？畫影？" },
      { id: "rebel_hint", text: "試探他是否與『怨秦』之人來往" },
    ],
    stateDelta: {
      flags: { spoke_scholar: true },
      identityHint: 7,
      location: "村西書齋",
      locationId: "scholar_hut",
    },
  },

  copy_books: {
    narrative:
      "你抄字極快，筆勢凌厲。陳微失聲：「這是……宮中教法？」你手一頓，墨滴绽開如血。\n\n窗外傳來 遠處的鑼聲：縣尉下鄉搜捕『形跡可疑、識字知律者』。",
    choices: [
      { id: "flee_search", text: "立刻逃離搜捕" },
      { id: "seek_truth", text: "對陳微坦白失憶，求他幫你拼湊身份" },
      { id: "quiet_path", text: "藏進地窖，從此只做農人" },
    ],
    stateDelta: {
      grain: 2,
      identityHint: 15,
      courtThreat: 10,
      addMemories: [{ id: "palace_script", title: "宮中筆法", text: "你的字被認作宮中教法，連你自己都心驚。" }],
    },
  },

  ask_yingzheng: {
    narrative:
      "陳微壓低聲音：「贏政，秦王之子，剛登基不久。有流言說他離奇失踪，朝中以假消息壓民。畫影是緝拿用的……你若真失憶，莫對人說你『像他』。」\n\n他指了指你胸口隱約的玉形：「那碎片，別給官差看見。」",
    choices: [
      { id: "seek_truth", text: "心跳如鼓——你要親自查證" },
      { id: "quiet_path", text: "恐懼湧上，寧願忘記一切" },
      { id: "reform_path", text: "無論是誰，先救眼前的民" },
    ],
    stateDelta: {
      identityHint: 20,
      courtThreat: 5,
      addMemories: [
        {
          id: "name_yingzheng",
          title: "名·贏政",
          text: "書生言及新君贏政失踪流言。你不敢承認自己在發抖。",
        },
      ],
    },
    memoryHints: ["贏政失踪流言"],
  },

  rebel_hint: {
    narrative:
      "陳微神色一變：「你是官差？……不是？那聽好：有人在山裡聚義，要『清君側』。我只傳書，不沾血。你若去，便再難回頭。」",
    choices: [
      { id: "rebel_path", text: "前往山寨，尋求力量" },
      { id: "seek_truth", text: "拒絕血腥，只求真相" },
      { id: "quiet_path", text: "抽身回村務農" },
    ],
    stateDelta: { flags: { joined_rebel_talk: true }, courtThreat: 8, identityHint: 5 },
  },

  seek_truth: {
    narrative:
      "你開始有意識地蒐集碎片：夢、玉、告示、筆法、巡邏密語。身份的輪廓像霧中山影——愈近，愈冷。\n\n縣中捕快已開始按『身高、眉骨、識字』排查。你必須抉擇去路。",
    choices: [
      { id: "throne_path", text: "若我真是……該回去，收拾亂局" },
      { id: "quiet_path", text: "放下——寧為農人，不為孤王" },
      { id: "reform_path", text: "不以名位，而以事功改民間苦" },
      { id: "rebel_path", text: "借山中之力，殺回真相" },
    ],
    stateDelta: { identityHint: 10, energy: -5, sceneId: "crossroad" },
  },

  // —— 路線節點（導向結局）——
  quiet_path: {
    narrative:
      "你隱去姓名，在青禾村墾荒。春耕秋收，劉嫂笑了，阿石長高了。有時夜里你仍夢見金殿，醒來只摸殘玉，然後把它埋進田埂。\n\n朝廷搜捕潮水般退去。民間傳說『失踪的王』已死於山中。你靜靜活著。",
    choices: [
      { id: "ending_folk", text: "就此終老田園（結局）" },
      { id: "seek_truth", text: "……仍不甘心，再追一次真相" },
    ],
    stateDelta: { flags: { quiet_life: true }, renown: 5, courtThreat: -15, day: 3, identityHint: 5 },
  },

  reform_path: {
    narrative:
      "你與陳微草擬條陳，聯結里正中的善者、商賈中的開明者。有人罵你狂生，有人暗中資助。縣令一度要拿你，卻因民憤暫緩。\n\n你仍不知自己是誰——但你知道民要寬賦、要息役。",
    choices: [
      { id: "ending_reform", text: "以布衣推動一縣之改（結局）" },
      { id: "throne_path", text: "改革受阻，你懷疑唯有更高之位才能成事" },
    ],
    stateDelta: { renown: 20, courtThreat: 15, day: 2, identityHint: 8 },
  },

  rebel_path: {
    narrative:
      "山寨篝火熊熊。首領要你獻策攻城。你看見孩童學殺人，心中作嘔——卻也看見糧倉裡囤著從民間搶來的粟。\n\n力量有價。血也有價。",
    choices: [
      { id: "ending_tragedy", text: "隨之起事，在火光中尋找『自己』（悲劇傾向）" },
      { id: "flee_search", text: "逃離山寨，另覓生路" },
      { id: "throne_path", text: "說服他們：真正的敵人不在縣城，而在謊言" },
    ],
    stateDelta: { courtThreat: 25, renown: -5, hp: -10, day: 1, identityHint: 10 },
  },

  throne_path: {
    narrative:
      "殘玉、筆法、夢殿、夜語……拼圖合攏的瞬間，你幾乎窒息。若你是那個人，流落民間的日子便是竊來的自由；若你不是，這一切巧合便是天弄人。\n\n遠方咸陽燈火如星。回去，或意味著重新戴上孤獨的冠冕。",
    choices: [
      { id: "ending_throne", text: "夜入咸陽，奪回——或確認——自己的位置（結局）" },
      { id: "ending_folk", text: "轉身：寧可殘缺，也不再為天下孤獨（結局）" },
      { id: "ending_tragedy", text: "在城門暴露身份，被當成刺客處置（悲劇）" },
    ],
    stateDelta: { identityHint: 30, courtThreat: 20, flags: { claimed_name: true } },
  },

  flee_search: {
    narrative:
      "你在田壟與河灘之間逃亡數日，糧盡，靴破。有人舉報，有人收留。最終你回到青禾村外的樹林，必須再做一次選擇。",
    choices: [
      { id: "quiet_path", text: "求劉嫂收留，隱姓埋名" },
      { id: "throne_path", text: "不再逃——迎向咸陽" },
      { id: "reform_path", text: "把逃亡所見寫成訴狀，交給陳微" },
    ],
    stateDelta: { hp: -15, energy: -20, grain: -1, day: 2, courtThreat: 10 },
  },

  // 結局
  ending_folk: {
    narrative:
      "【結局·隱於民間】\n\n多年後，青禾村多了一位寡言的農夫。孩子們叫他「政叔」——只因他曾盯著殘玉上的字發呆。咸陽更換了多少政令，他只問雨水與麥苗。\n\n有時他望著北方，像在對誰道歉，又像在告別。\n\n（示範模式完。填入 DeepSeek API Key 可體驗動態劇情。）",
    choices: [{ id: "restart", text: "重新開始" }],
    stateDelta: { ending: "folk", flags: { ending: "folk" } },
  },

  ending_throne: {
    narrative:
      "【結局·重奪皇位】\n\n你以殘玉與記憶為憑，踏過層層謊言。殿上眾人跪伏，有喜有懼。你坐回那個位置時，民間的黍粥香仍殘在舌尖。\n\n你下令寬一面之賦，又令人徹查當日「失踪」之陰謀。皇冠很重——但你已知道民間的土也重。\n\n（示範模式完。接入 DeepSeek 可延續朝堂與人心的博弈。）",
    choices: [{ id: "restart", text: "重新開始" }],
    stateDelta: { ending: "throne", flags: { ending: "throne" }, identityHint: 100 },
  },

  ending_reform: {
    narrative:
      "【結局·改革民間】\n\n你始終未稱王，卻讓一縣賦役減輕。陳微的書流傳開去，有人視你為禍端，有人立了無名長生位。捕快來時，村民以身相護。\n\n你仍失憶——或假裝失憶。殘玉埋在槐樹下，與種子一起。\n\n（示範模式完。）",
    choices: [{ id: "restart", text: "重新開始" }],
    stateDelta: { ending: "reform", flags: { ending: "reform" }, renown: 40 },
  },

  ending_tragedy: {
    narrative:
      "【結局·悲劇】\n\n火光與刀影裡，有人喊你的名字——那個你不敢承認的名字。箭矢穿過肩胛時，你忽然想起孩提時的宮牆，與登基那夜無人祝賀的寂靜。\n\n你倒在泥土上，聽見有人說：「原來他真的在民間。」\n\n天色微明。雞再次啼叫。\n\n（示範模式完。）",
    choices: [{ id: "restart", text: "重新開始" }],
    stateDelta: { ending: "tragedy", flags: { ending: "tragedy" }, hp: 0 },
  },
};

/** 自訂輸入時的簡易規則回退 */
export function demoCustomReply(state, text) {
  const t = (text || "").trim();
  let nextId = "seek_truth";
  if (/農|隱|村|不回去|低調/.test(t)) nextId = "quiet_path";
  else if (/皇|王|咸陽|回去|登基|身份/.test(t)) nextId = "throne_path";
  else if (/改|賦|民|寬|陳微/.test(t)) nextId = "reform_path";
  else if (/殺|反|山寨|武力/.test(t)) nextId = "rebel_path";
  else if (/告示|尋人/.test(t)) nextId = "read_notice";
  else if (/書生|陳/.test(t)) nextId = "meet_scholar";
  else if (/孩子|孤兒|阿石/.test(t)) nextId = "orphan_plot";
  else if (state.locationId === "post_station" || state.sceneId === "wake") nextId = "to_village";

  const scene = SCENES[nextId];
  return {
    narrative: `你心中轉念：「${t.slice(0, 40)}」——於是腳步改了方向。\n\n` + scene.narrative,
    choices: scene.choices,
    stateDelta: { ...(scene.stateDelta || {}), energy: -3 },
    memoryHints: scene.memoryHints || [],
    ending: scene.stateDelta?.ending || null,
    _demoScene: nextId,
  };
}

export function getDemoScene(sceneId) {
  return SCENES[sceneId] || null;
}

export function listDemoSceneIds() {
  return Object.keys(SCENES);
}
