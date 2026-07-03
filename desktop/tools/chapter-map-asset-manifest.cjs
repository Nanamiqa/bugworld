module.exports = {
  badgeSize: { width: 320, height: 180 },
  candidateSize: { width: 1920, height: 1080 },
  candidateFile: "desktop/steam/store-assets/review/chapter-map-candidate-compositions-v1.png",
  maps: [
    {
      id: "metro-loop",
      assetKey: "chapterBadgeMetroLoop",
      title: "第二章：环线影子",
      file: "src/assets/maps/chapter-badge-metro-loop-v1.png",
      palette: {
        background: [20, 37, 55],
        primary: [114, 165, 255],
        secondary: [93, 226, 209],
        hazard: [241, 193, 91],
      },
      motifs: ["rail", "terminal", "crowd"],
    },
    {
      id: "hash-market",
      assetKey: "chapterBadgeHashMarket",
      title: "第三章：夜市哈希雨",
      file: "src/assets/maps/chapter-badge-hash-market-v1.png",
      palette: {
        background: [44, 31, 45],
        primary: [247, 180, 216],
        secondary: [241, 193, 91],
        hazard: [93, 226, 209],
      },
      motifs: ["awnings", "rain", "stalls"],
    },
    {
      id: "promise-tower",
      assetKey: "chapterBadgePromiseTower",
      title: "第四章：承诺塔递归",
      file: "src/assets/maps/chapter-badge-promise-tower-v1.png",
      palette: {
        background: [30, 35, 61],
        primary: [151, 126, 255],
        secondary: [247, 180, 216],
        hazard: [255, 255, 255],
      },
      motifs: ["tower", "branches", "loops"],
    },
    {
      id: "whitebox-core",
      assetKey: "chapterBadgeWhiteboxCore",
      title: "第五章：白箱之外",
      file: "src/assets/maps/chapter-badge-whitebox-core-v1.png",
      palette: {
        background: [230, 235, 242],
        primary: [72, 94, 122],
        secondary: [114, 165, 255],
        hazard: [239, 106, 112],
      },
      motifs: ["grid", "scan", "core"],
    },
  ],
};
