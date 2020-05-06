import { Asset } from 'expo-asset';
import ExpoTHREE from 'expo-three';
import * as FileSystem from 'expo-file-system';
import { IResourcesProvider, getRequireResources } from '@persona-core';

async function loadShaderAsync(moduleId: number, name: string) {
    try {
        const asset = Asset.fromModule(moduleId);
        if (!asset.downloaded) {
            await asset.downloadAsync();
        }

        // const f = await fetch(asset.localUri);
        // const raw = await f.text();

        const raw = await FileSystem.readAsStringAsync(asset.localUri);
        return raw;
    } catch (err) {
        console.error('Failed to load shader:', name, moduleId);
        throw err;
    }
}

export async function getExpoAssetsAsync(): Promise<IResourcesProvider> {

    const baseResources = getRequireResources();

    const shaders = Object.keys(baseResources.shaders)
        .map((key: keyof typeof baseResources.shaders) => ({
            key,
            resource: baseResources.shaders[key],
        }));

    await Promise.all(shaders.map(async s => {
        const raw = await loadShaderAsync(s.resource.raw, s.key);
        s.resource.raw = raw;
    }));

    if (IResourcesProvider.isUrlResource(baseResources.textures.noise)) {
        baseResources.textures.noise = {
            raw: await ExpoTHREE.loadTextureAsync({ asset: baseResources.textures.noise.url }),
        };
    }

    return baseResources;
}
