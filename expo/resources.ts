import { IResourcesProvider } from '../lib';
import { getRequireResources } from '../lib/resources.require';
import { Asset } from 'expo-asset';
import ExpoTHREE from 'expo-three';
import { isUrlResource } from '../lib/abstractions';

async function loadShaderAsync(moduleId: number) {
    const asset = Asset.fromModule(moduleId);
    if (!asset.downloaded) {
        await asset.downloadAsync();
    }

    const f = await fetch(asset.localUri);
    const raw = await f.text();
    return raw;
}

export async function getExpoAssetsAsync(): Promise<IResourcesProvider> {

    const baseResources = getRequireResources();

    const shaders = Object.keys(baseResources.shaders)
        .map((key: keyof typeof baseResources.shaders) => ({
            key,
            resource: baseResources.shaders[key],
        }));

    await Promise.all(shaders.map(async s => {
        const raw = await loadShaderAsync(s.resource.raw);
        s.resource.raw = raw;
    }));

    if (isUrlResource(baseResources.textures.noise)) {
        baseResources.textures.noise = {
            raw: await ExpoTHREE.loadTextureAsync({ asset: baseResources.textures.noise.url }),
        };
    }

    return baseResources;
}