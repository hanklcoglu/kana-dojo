// Kana data. Each row: id, label, group, and [hiragana, katakana, romaji, ...alternative romaji]
const KANA_ROWS = [
  { id: "a",  label: "あ a",  group: "basic", items: [["あ","ア","a"],["い","イ","i"],["う","ウ","u"],["え","エ","e"],["お","オ","o"]] },
  { id: "k",  label: "か ka", group: "basic", items: [["か","カ","ka"],["き","キ","ki"],["く","ク","ku"],["け","ケ","ke"],["こ","コ","ko"]] },
  { id: "s",  label: "さ sa", group: "basic", items: [["さ","サ","sa"],["し","シ","shi","si"],["す","ス","su"],["せ","セ","se"],["そ","ソ","so"]] },
  { id: "t",  label: "た ta", group: "basic", items: [["た","タ","ta"],["ち","チ","chi","ti"],["つ","ツ","tsu","tu"],["て","テ","te"],["と","ト","to"]] },
  { id: "n",  label: "な na", group: "basic", items: [["な","ナ","na"],["に","ニ","ni"],["ぬ","ヌ","nu"],["ね","ネ","ne"],["の","ノ","no"]] },
  { id: "h",  label: "は ha", group: "basic", items: [["は","ハ","ha"],["ひ","ヒ","hi"],["ふ","フ","fu","hu"],["へ","ヘ","he"],["ほ","ホ","ho"]] },
  { id: "m",  label: "ま ma", group: "basic", items: [["ま","マ","ma"],["み","ミ","mi"],["む","ム","mu"],["め","メ","me"],["も","モ","mo"]] },
  { id: "y",  label: "や ya", group: "basic", items: [["や","ヤ","ya"],["ゆ","ユ","yu"],["よ","ヨ","yo"]] },
  { id: "r",  label: "ら ra", group: "basic", items: [["ら","ラ","ra"],["り","リ","ri"],["る","ル","ru"],["れ","レ","re"],["ろ","ロ","ro"]] },
  { id: "w",  label: "わ wa", group: "basic", items: [["わ","ワ","wa"],["を","ヲ","wo","o"],["ん","ン","n","nn"]] },

  { id: "g",  label: "が ga", group: "dakuten", items: [["が","ガ","ga"],["ぎ","ギ","gi"],["ぐ","グ","gu"],["げ","ゲ","ge"],["ご","ゴ","go"]] },
  { id: "z",  label: "ざ za", group: "dakuten", items: [["ざ","ザ","za"],["じ","ジ","ji","zi"],["ず","ズ","zu"],["ぜ","ゼ","ze"],["ぞ","ゾ","zo"]] },
  { id: "d",  label: "だ da", group: "dakuten", items: [["だ","ダ","da"],["ぢ","ヂ","ji","di"],["づ","ヅ","zu","du"],["で","デ","de"],["ど","ド","do"]] },
  { id: "b",  label: "ば ba", group: "dakuten", items: [["ば","バ","ba"],["び","ビ","bi"],["ぶ","ブ","bu"],["べ","ベ","be"],["ぼ","ボ","bo"]] },
  { id: "p",  label: "ぱ pa", group: "dakuten", items: [["ぱ","パ","pa"],["ぴ","ピ","pi"],["ぷ","プ","pu"],["ぺ","ペ","pe"],["ぽ","ポ","po"]] },

  { id: "ky", label: "きゃ kya", group: "yoon", items: [["きゃ","キャ","kya"],["きゅ","キュ","kyu"],["きょ","キョ","kyo"]] },
  { id: "sy", label: "しゃ sha", group: "yoon", items: [["しゃ","シャ","sha","sya"],["しゅ","シュ","shu","syu"],["しょ","ショ","sho","syo"]] },
  { id: "cy", label: "ちゃ cha", group: "yoon", items: [["ちゃ","チャ","cha","tya"],["ちゅ","チュ","chu","tyu"],["ちょ","チョ","cho","tyo"]] },
  { id: "ny", label: "にゃ nya", group: "yoon", items: [["にゃ","ニャ","nya"],["にゅ","ニュ","nyu"],["にょ","ニョ","nyo"]] },
  { id: "hy", label: "ひゃ hya", group: "yoon", items: [["ひゃ","ヒャ","hya"],["ひゅ","ヒュ","hyu"],["ひょ","ヒョ","hyo"]] },
  { id: "my", label: "みゃ mya", group: "yoon", items: [["みゃ","ミャ","mya"],["みゅ","ミュ","myu"],["みょ","ミョ","myo"]] },
  { id: "ry", label: "りゃ rya", group: "yoon", items: [["りゃ","リャ","rya"],["りゅ","リュ","ryu"],["りょ","リョ","ryo"]] },
  { id: "gy", label: "ぎゃ gya", group: "yoon", items: [["ぎゃ","ギャ","gya"],["ぎゅ","ギュ","gyu"],["ぎょ","ギョ","gyo"]] },
  { id: "jy", label: "じゃ ja",  group: "yoon", items: [["じゃ","ジャ","ja","jya","zya"],["じゅ","ジュ","ju","jyu","zyu"],["じょ","ジョ","jo","jyo","zyo"]] },
  { id: "by", label: "びゃ bya", group: "yoon", items: [["びゃ","ビャ","bya"],["びゅ","ビュ","byu"],["びょ","ビョ","byo"]] },
  { id: "py", label: "ぴゃ pya", group: "yoon", items: [["ぴゃ","ピャ","pya"],["ぴゅ","ピュ","pyu"],["ぴょ","ピョ","pyo"]] },
];

const GROUP_LABELS = { basic: "Basic (gojūon)", dakuten: "Dakuten ゛ and handakuten ゜", yoon: "Combinations (yōon)" };
