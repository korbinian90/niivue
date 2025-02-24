const { snapshot, httpServerAddress, seconds } = require("./helpers");
beforeEach(async () => {
  await page.goto(httpServerAddress, { timeout: 0 });
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
});
test("labelsReplacedForNewConnectome", async () => {
  let labels = await page.evaluate(async () => {
    let nv = new niivue.Niivue({ show3Dcrosshair: true, isColorbar: true });
    await nv.attachTo("gl", false);
    // load one volume object in an array
    var volumeList = [
      {
        url: "./images/mni152.nii.gz", //"./RAS.nii.gz", "./spm152.nii.gz",
        volume: { hdr: null, img: null },
        name: "mni152.nii.gz",
        colormap: "gray",
        opacity: 1,
        visible: true,
      },
    ];
    await nv.loadVolumes(volumeList);
    nv.opts.meshXRay = 0.2;

    let connectome = {
      name: "simpleConnectome",
      nodeColormap: "warm",
      nodeColormapNegative: "winter",
      nodeMinColor: 2,
      nodeMaxColor: 4,
      nodeScale: 3, //scale factor for node, e.g. if 2 and a node has size 3, a 6mm ball is drawn
      edgeColormap: "warm",
      edgeColormapNegative: "winter",
      edgeMin: 2,
      edgeMax: 6,
      edgeScale: 1,
      nodes: {
        names: ["RF", "LF", "RP", "LP"], //currently unused
        X: [40, -40, 40, -40], //Xmm for each node
        Y: [40, 40, -40, -40], //Ymm for each node
        Z: [30, 20, 50, 50], //Zmm for each node
        Color: [2, 2, 3, 4], //Used to interpolate color
        Size: [2, 2, 3, 4], //Size of node
      },
      edges: [1, 2, -3, 4, 0, 1, 0, 6, 0, 0, 1, 0, 0, 0, 0, 1],
    };

    await nv.loadConnectome(connectome);
    // load the connectome again to verify that no new labels are added
    connectome.nodes = {
      names: ["NewRF", "NewLF", "NewRP", "NewLP"], //currently unused
      X: [40, -40, 40, -40], //Xmm for each node
      Y: [40, 40, -40, -40], //Ymm for each node
      Z: [30, 20, 50, 50], //Zmm for each node
      Color: [2, 2, 3, 4], //Used to interpolate color
      Size: [2, 2, 3, 4], //Size of node
    },
    await nv.loadConnectome(connectome);
    nv.setMeshProperty(nv.meshes[0].id, "nodeScale", 3);
    nv.setClipPlane([-0.1, 270, 0]);

    return nv.document.labels;
  });
  expect(labels.length).toBe(4);
  expect(labels[0].text).toEqual("NewRF");
  await snapshot();
});
