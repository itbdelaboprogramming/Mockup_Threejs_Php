importScripts('three.min.js');
importScripts('SimplifyModifier.js');
importScripts('BufferGeometryUtils.js');

self.onmessage = function (event) {
    const { geometriesData, simplificationPercentage } = event.data;

    try {
        console.log(`[Worker] Menerima ${geometriesData.length} geometri untuk digabungkan.`);
        
        const geometries = geometriesData.map(data => {
            const loader = new THREE.BufferGeometryLoader();
            return loader.parse(data);
        });

        if (geometries.length === 0) {
            throw new Error('No geometries received.');
        }

        console.log("[Worker] Menggabungkan semua geometri...");
        const mergedGeometry = THREE.BufferGeometryUtils.mergeGeometries(geometries, true);
        
        if (!mergedGeometry) {
             throw new Error("Gagal menggabungkan geometri.");
        }

        const originalVertexCount = mergedGeometry.attributes.position.count;
        console.log(`[Worker] Geometri berhasil digabung. Total vertices: ${originalVertexCount}`);

        const modifier = new THREE.SimplifyModifier();
        const targetVertexCount = Math.floor(originalVertexCount * (1 - simplificationPercentage));
        console.log(`[Worker] Menyederhanakan menjadi ${targetVertexCount} vertices.`);

        const simplifiedGeometry = modifier.modify(mergedGeometry, targetVertexCount);

        console.log("[Worker] Simplifikasi berhasil. Mengirim data kembali.");
        self.postMessage({
            status: 'success',
            simplifiedGeometryData: simplifiedGeometry.toJSON().data,
        });

    } catch (error) {
        console.error("[Worker] Error:", error);
        self.postMessage({ status: 'error', message: error.message.toString() });
    } finally {
        geometries.forEach(g => g.dispose());
    }
};