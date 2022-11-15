import argon2, { Options } from "argon2";

const argon2Options: Options = {
    type: argon2.argon2i,
    hashLength: 96
}

export default argon2Options;