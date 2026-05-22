/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/capstone_anchor.json`.
 */
export type CapstoneAnchor = {
  "address": "ieBaBaedCadehYhjhesE8yo4pAfdT82t4Z3Y8ic9b1n",
  "metadata": {
    "name": "capstoneAnchor",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "donate",
      "discriminator": [
        121,
        186,
        218,
        211,
        73,
        70,
        196,
        180
      ],
      "accounts": [
        {
          "name": "jar",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  106,
                  97,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "jar.creator",
                "account": "tipJar"
              }
            ]
          }
        },
        {
          "name": "donor",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initJar",
      "discriminator": [
        186,
        110,
        5,
        129,
        180,
        11,
        167,
        246
      ],
      "accounts": [
        {
          "name": "jar",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  106,
                  97,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "jar",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  106,
                  97,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true,
          "relations": [
            "jar"
          ]
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "tipJar",
      "discriminator": [
        1,
        2,
        42,
        158,
        102,
        246,
        174,
        210
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "zeroAmount",
      "msg": "Donation amount must be greater than zero"
    },
    {
      "code": 6001,
      "name": "overflow",
      "msg": "Overflow on jar counters"
    },
    {
      "code": 6002,
      "name": "insufficientFunds",
      "msg": "Insufficient withdrawable funds (rent-exempt minimum must remain)"
    }
  ],
  "types": [
    {
      "name": "tipJar",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "totalRaised",
            "type": "u64"
          },
          {
            "name": "donationCount",
            "type": "u64"
          },
          {
            "name": "lastDonor",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
