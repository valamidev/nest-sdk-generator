import { Option } from 'typescript-core'

export const CENTRAL_FILE = (relativePath: string, nameToImport: Option<string>) =>
  `

import { ${nameToImport.unwrapOr('default')} as importedCentralConfig } from "${relativePath
    .replace(/\\/g, '/')
    .replace(/\.([jt]sx?)$/, '')}"

export type CentralMethodType = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface CentralHandlerRequest {
    readonly method: CentralMethodType,
    readonly uri: string,
    readonly query: Record<string, unknown>,
    readonly body: unknown
}

export type CentralHandler = (request: CentralHandlerRequest) => Promise<unknown>

export interface CentralConfig {
    readonly handler: CentralHandler,
    readonly init?: () => void,
    readonly errorsLogger?: ((error: unknown, request: CentralHandlerRequest) => void)
}

export const config: CentralConfig = {...importedCentralConfig}

config.init?.()

export async function req(
    method: CentralMethodType,
    uri: string,
    query: Record<string, unknown>,
    body: unknown
): Promise<any> {
    const req: CentralHandlerRequest = { method, uri, query, body }

    return config.handler(req).catch((err) => {
        config.errorsLogger?.(err, req);
        return Promise.reject(err);
    })
}

`.trim()
