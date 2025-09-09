let optimizerWorker;

function initOptimizer() {
    if (!optimizerWorker) {
        optimizerWorker = new Worker('./optimizer.worker.js', { type: 'module' });
    }
    return optimizerWorker;
}

function simplifyModel(model, simplificationPercentage) {
    return new Promise((resolve, reject) => {
        const worker = initOptimizer();

        const geometriesToSimplify = [];
        model.traverse(child => {
            if (child.isMesh) {
                const geometryData = child.geometry.toJSON().data;
                geometriesToSimplify.push({
                    uuid: child.uuid,
                    geometryData: geometryData
                });
            }
        });

        if (geometriesToSimplify.length === 0) {
            return reject(new Error("No mesh found in the model."));
        }
        
        const target = geometriesToSimplify[0];
        const onMessage = (event) => {
            console.log("[Manager] Menerima pesan dari worker:", event.data);
            worker.removeEventListener('message', onMessage); 
            if (event.data.status === 'success') {
                resolve({
                    uuid: target.uuid,
                    simplifiedGeometryData: event.data.simplifiedGeometryData,
                });
            } else {
                reject(new Error(event.data.message || "Unknown worker error"));
            }
        };

        worker.addEventListener('message', onMessage);
        // console.log("[Manager] post message to worker.");
        worker.postMessage({
            geometryData: target.geometryData,
            simplificationPercentage: simplificationPercentage
        });
    });
}

export { simplifyModel };