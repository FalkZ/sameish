type PlainObject = Record<string, unknown>

const randomInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min

const randomString = (): string =>
    Math.random().toString(36).substring(2, 8)

const randomPrimitive = (): unknown => {
    const type = randomInt(0, 4)
    switch (type) {
        case 0: return randomInt(-1000, 1000)
        case 1: return randomString()
        case 2: return Math.random() < 0.5
        case 3: return undefined
        default: return Math.random()
    }
}

export const createNestedRandomObject = (
    depth: number = 3,
    breadth: number = 3
): PlainObject => {
    const obj: PlainObject = {}
    const numKeys = randomInt(1, breadth)

    for (let i = 0; i < numKeys; i++) {
        const key = randomString()
        if (depth > 1 && Math.random() > 0.3) {
            obj[key] = createNestedRandomObject(depth - 1, breadth)
        } else {
            obj[key] = randomPrimitive()
        }
    }

    return obj
}

export const scrambleObjectKeys = <T extends PlainObject>(obj: T): PlainObject => {
    const copy = structuredClone(obj) as PlainObject
    const scramble = (target: PlainObject): PlainObject => {
        const keys = Object.keys(target)
        const shuffledKeys = keys.sort(() => Math.random() - 0.5)
        const result: PlainObject = {}

        for (const key of shuffledKeys) {
            const value = target[key]
            result[key] = value !== null && typeof value === "object" && !Array.isArray(value)
                ? scramble(value as PlainObject)
                : value
        }

        return result
    }

    return scramble(copy)
}

export const addRandomChange = <T extends PlainObject>(obj: T): PlainObject => {
    const copy = structuredClone(obj) as PlainObject

    const getAllPaths = (target: PlainObject, prefix: string = ""): string[] => {
        const paths: string[] = [prefix].filter(Boolean)
        for (const [key, value] of Object.entries(target)) {
            const path = prefix ? `${prefix}.${key}` : key
            paths.push(path)
            if (value !== null && typeof value === "object" && !Array.isArray(value)) {
                paths.push(...getAllPaths(value as PlainObject, path))
            }
        }
        return paths
    }

    const setAtPath = (target: PlainObject, path: string, value: unknown): void => {
        const parts = path.split(".")
        let current = target
        for (let i = 0; i < parts.length - 1; i++) {
            current = current[parts[i]] as PlainObject
        }
        current[parts[parts.length - 1]] = value
    }

    const getAtPath = (target: PlainObject, path: string): unknown => {
        const parts = path.split(".")
        let current: unknown = target
        for (const part of parts) {
            current = (current as PlainObject)[part]
        }
        return current
    }

    const paths = getAllPaths(copy)
    const changeType = randomInt(0, 2)

    if (changeType === 0 && paths.length > 0) {
        const randomPath = paths[randomInt(0, paths.length - 1)]
        const currentValue = getAtPath(copy, randomPath)
        let newValue: unknown
        do {
            newValue = randomPrimitive()
        } while (newValue === currentValue)
        setAtPath(copy, randomPath, newValue)
    } else if (changeType === 1) {
        const parentPaths = paths.filter(p => {
            const val = getAtPath(copy, p)
            return val !== null && typeof val === "object" && !Array.isArray(val)
        })
        const targetPath = parentPaths.length > 0
            ? parentPaths[randomInt(0, parentPaths.length - 1)]
            : ""
        const target = targetPath ? getAtPath(copy, targetPath) as PlainObject : copy
        target[randomString()] = randomPrimitive()
    } else if (paths.length > 0) {
        const leafPaths = paths.filter(p => {
            const val = getAtPath(copy, p)
            return val === null || typeof val !== "object"
        })
        if (leafPaths.length > 0) {
            const pathToDelete = leafPaths[randomInt(0, leafPaths.length - 1)]
            const parts = pathToDelete.split(".")
            const key = parts.pop()!
            const parent = parts.length > 0 ? getAtPath(copy, parts.join(".")) as PlainObject : copy
            delete parent[key]
        }
    }

    return copy
}

export const insertRandomArray = <T extends PlainObject>(
    obj: T
): [PlainObject, string] => {
    const copy = structuredClone(obj) as PlainObject

    const generateDistinctElements = (): unknown[] => {
        const elements: unknown[] = []
        const seen = new Set<string>()

        while (elements.length < 3) {
            const element = Math.random() > 0.5
                ? randomPrimitive()
                : createNestedRandomObject(2, 2)
            const key = JSON.stringify(element)
            if (!seen.has(key)) {
                seen.add(key)
                elements.push(element)
            }
        }

        const extraCount = randomInt(0, 2)
        for (let i = 0; i < extraCount; i++) {
            elements.push(
                Math.random() > 0.5 ? randomPrimitive() : createNestedRandomObject(2, 2)
            )
        }

        return elements
    }

    const array = generateDistinctElements()

    const getObjectPaths = (target: PlainObject, prefix: string = ""): string[] => {
        const paths: string[] = [prefix].filter(Boolean)
        for (const [key, value] of Object.entries(target)) {
            const path = prefix ? `${prefix}.${key}` : key
            if (value !== null && typeof value === "object" && !Array.isArray(value)) {
                paths.push(...getObjectPaths(value as PlainObject, path))
            }
        }
        return paths.length > 0 ? paths : [""]
    }

    const paths = getObjectPaths(copy)
    const chosenPath = paths[randomInt(0, paths.length - 1)]
    const newKey = randomString()
    const fullPath = chosenPath ? `${chosenPath}.${newKey}` : newKey

    const parts = fullPath.split(".")
    let current = copy

    for (let i = 0; i < parts.length - 1; i++) {
        if (!(parts[i] in current) || typeof current[parts[i]] !== "object") {
            current[parts[i]] = {}
        }
        current = current[parts[i]] as PlainObject
    }

    current[parts[parts.length - 1]] = array

    return [copy, fullPath]
}

export const scrambleArrayAtPath = <T extends PlainObject>(
    obj: T,
    path: string
): PlainObject => {
    const copy = structuredClone(obj) as PlainObject
    const parts = path.split(".").filter(Boolean)

    let current: unknown = copy
    for (let i = 0; i < parts.length - 1; i++) {
        current = (current as PlainObject)[parts[i]]
        if (current === undefined) return copy
    }

    const key = parts[parts.length - 1]
    const target = (current as PlainObject)[key]

    if (!Array.isArray(target) || target.length < 2) return copy

    const original = [...target]
    let shuffled = [...target]

    const arraysEqual = (a: unknown[], b: unknown[]): boolean =>
        a.length === b.length && a.every((v, i) => v === b[i])

    do {
        shuffled = [...target].sort(() => Math.random() - 0.5)
    } while (arraysEqual(shuffled, original))

    ;(current as PlainObject)[key] = shuffled

    return copy
}
