import { MinimalKairosConnection } from './kairos-minimal.js'

export class KairosConnection extends MinimalKairosConnection {
	// async updateLayer(params: UpdateLayerCommandParameters): Promise<APIRequest<Commands.UpdateLayer>> {
	// 	// return this.executeCommand({
	// 	// 	command: Commands.UpdateLayer,
	// 	// 	params,
	// 	// })
	// }
}

// export interface UpdateLayerCommandParameters<SceneName extends string, LayerName extends string> {
// 	sceneName: SceneName
// 	layerName: LayerName
// 	props: Partial<{
// 		source: string
// 		sdfsd: number
// 		adf: boolean
// 	}>
// }
