import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ConnectoNFTManager
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const connectoNftManagerAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'defaultAdmin_', internalType: 'address', type: 'address' },
      { name: 'collectionHelper_', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [{ name: 'message', internalType: 'string', type: 'string' }],
    name: 'Forbidden',
  },
  {
    type: 'error',
    inputs: [
      { name: 'actualAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'expectedAmount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InsufficientAmount',
  },
  { type: 'error', inputs: [], name: 'TransferFailed' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'collectionAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'NewCollection',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'managerContract', internalType: 'address', type: 'address' },
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'description', internalType: 'string', type: 'string' },
      { name: 'symbol', internalType: 'string', type: 'string' },
      { name: 'baseURI', internalType: 'string', type: 'string' },
    ],
    name: 'createCollection',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collectionAddr', internalType: 'address', type: 'address' },
      {
        name: 'data',
        internalType: 'struct MintTokenData[]',
        type: 'tuple[]',
        components: [
          {
            name: 'owner',
            internalType: 'struct CrossAddress',
            type: 'tuple',
            components: [
              { name: 'eth', internalType: 'address', type: 'address' },
              { name: 'sub', internalType: 'uint256', type: 'uint256' },
            ],
          },
          {
            name: 'properties',
            internalType: 'struct Property[]',
            type: 'tuple[]',
            components: [
              { name: 'key', internalType: 'string', type: 'string' },
              { name: 'value', internalType: 'bytes', type: 'bytes' },
            ],
          },
        ],
      },
    ],
    name: 'mintBulkCrossToCollection',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collectionAddr', internalType: 'address', type: 'address' },
      {
        name: 'to',
        internalType: 'struct CrossAddress',
        type: 'tuple',
        components: [
          { name: 'eth', internalType: 'address', type: 'address' },
          { name: 'sub', internalType: 'uint256', type: 'uint256' },
        ],
      },
      {
        name: 'properties',
        internalType: 'struct Property[]',
        type: 'tuple[]',
        components: [
          { name: 'key', internalType: 'string', type: 'string' },
          { name: 'value', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'mintCrossToCollection',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collectionAddr', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
    ],
    name: 'mintToCollection',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'setConnectoToken',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'treasury', internalType: 'address', type: 'address' }],
    name: 'setTreasury',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ConnectoProtocol
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const connectoProtocolAbi = [
  {
    type: 'error',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'InvalidAmount',
  },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'idol',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Donated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'function',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'idol', internalType: 'address', type: 'address' },
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'donate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feeCollector',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feePercentage',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'defaultOwner_', internalType: 'address', type: 'address' },
      { name: 'feeCollector_', internalType: 'address', type: 'address' },
      { name: 'feePercentage_', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link connectoNftManagerAbi}__
 */
export const useReadConnectoNftManager = /*#__PURE__*/ createUseReadContract({
  abi: connectoNftManagerAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link connectoNftManagerAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadConnectoNftManagerDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: connectoNftManagerAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link connectoNftManagerAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadConnectoNftManagerGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: connectoNftManagerAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link connectoNftManagerAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadConnectoNftManagerHasRole =
  /*#__PURE__*/ createUseReadContract({
    abi: connectoNftManagerAbi,
    functionName: 'hasRole',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link connectoNftManagerAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadConnectoNftManagerSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: connectoNftManagerAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link connectoNftManagerAbi}__
 */
export const useWriteConnectoNftManager = /*#__PURE__*/ createUseWriteContract({
  abi: connectoNftManagerAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link connectoNftManagerAbi}__ and `functionName` set to `"createCollection"`
 */
export const useWriteConnectoNftManagerCreateCollection =
  /*#__PURE__*/ createUseWriteContract({
    abi: connectoNftManagerAbi,
    functionName: 'createCollection',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link connectoNftManagerAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteConnectoNftManagerGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: connectoNftManagerAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link connectoNftManagerAbi}__ and `functionName` set to `"mintBulkCrossToCollection"`
 */
export const useWriteConnectoNftManagerMintBulkCrossToCollection =
  /*#__PURE__*/ createUseWriteContract({
    abi: connectoNftManagerAbi,
    functionName: 'mintBulkCrossToCollection',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link connectoNftManagerAbi}__ and `functionName` set to `"mintCrossToCollection"`
 */
export const useWriteConnectoNftManagerMintCrossToCollection =
  /*#__PURE__*/ createUseWriteContract({
    abi: connectoNftManagerAbi,
    functionName: 'mintCrossToCollection',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link connectoNftManagerAbi}__ and `functionName` set to `"mintToCollection"`
 */
export const useWriteConnectoNftManagerMintToCollection =
  /*#__PURE__*/ createUseWriteContract({
    abi: connectoNftManagerAbi,
    functionName: 'mintToCollection',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link connectoNftManagerAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteConnectoNftManagerRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: connectoNftManagerAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link connectoNftManagerAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteConnectoNftManagerRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: connectoNftManagerAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link connectoNftManagerAbi}__ and `functionName` set to `"setConnectoToken"`
 */
export const useWriteConnectoNftManagerSetConnectoToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: connectoNftManagerAbi,
    functionName: 'setConnectoToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link connectoNftManagerAbi}__ and `functionName` set to `"setTreasury"`
 */
export const useWriteConnectoNftManagerSetTreasury =
  /*#__PURE__*/ createUseWriteContract({
    abi: connectoNftManagerAbi,
    functionName: 'setTreasury',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link connectoNftManagerAbi}__
 */
export const useSimulateConnectoNftManager =
  /*#__PURE__*/ createUseSimulateContract({ abi: connectoNftManagerAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link connectoNftManagerAbi}__ and `functionName` set to `"createCollection"`
 */
export const useSimulateConnectoNftManagerCreateCollection =
  /*#__PURE__*/ createUseSimulateContract({
    abi: connectoNftManagerAbi,
    functionName: 'createCollection',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link connectoNftManagerAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateConnectoNftManagerGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: connectoNftManagerAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link connectoNftManagerAbi}__ and `functionName` set to `"mintBulkCrossToCollection"`
 */
export const useSimulateConnectoNftManagerMintBulkCrossToCollection =
  /*#__PURE__*/ createUseSimulateContract({
    abi: connectoNftManagerAbi,
    functionName: 'mintBulkCrossToCollection',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link connectoNftManagerAbi}__ and `functionName` set to `"mintCrossToCollection"`
 */
export const useSimulateConnectoNftManagerMintCrossToCollection =
  /*#__PURE__*/ createUseSimulateContract({
    abi: connectoNftManagerAbi,
    functionName: 'mintCrossToCollection',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link connectoNftManagerAbi}__ and `functionName` set to `"mintToCollection"`
 */
export const useSimulateConnectoNftManagerMintToCollection =
  /*#__PURE__*/ createUseSimulateContract({
    abi: connectoNftManagerAbi,
    functionName: 'mintToCollection',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link connectoNftManagerAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateConnectoNftManagerRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: connectoNftManagerAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link connectoNftManagerAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateConnectoNftManagerRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: connectoNftManagerAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link connectoNftManagerAbi}__ and `functionName` set to `"setConnectoToken"`
 */
export const useSimulateConnectoNftManagerSetConnectoToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: connectoNftManagerAbi,
    functionName: 'setConnectoToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link connectoNftManagerAbi}__ and `functionName` set to `"setTreasury"`
 */
export const useSimulateConnectoNftManagerSetTreasury =
  /*#__PURE__*/ createUseSimulateContract({
    abi: connectoNftManagerAbi,
    functionName: 'setTreasury',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link connectoNftManagerAbi}__
 */
export const useWatchConnectoNftManagerEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: connectoNftManagerAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link connectoNftManagerAbi}__ and `eventName` set to `"NewCollection"`
 */
export const useWatchConnectoNftManagerNewCollectionEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: connectoNftManagerAbi,
    eventName: 'NewCollection',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link connectoNftManagerAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchConnectoNftManagerRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: connectoNftManagerAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link connectoNftManagerAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchConnectoNftManagerRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: connectoNftManagerAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link connectoNftManagerAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchConnectoNftManagerRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: connectoNftManagerAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link connectoProtocolAbi}__
 */
export const useReadConnectoProtocol = /*#__PURE__*/ createUseReadContract({
  abi: connectoProtocolAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link connectoProtocolAbi}__ and `functionName` set to `"feeCollector"`
 */
export const useReadConnectoProtocolFeeCollector =
  /*#__PURE__*/ createUseReadContract({
    abi: connectoProtocolAbi,
    functionName: 'feeCollector',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link connectoProtocolAbi}__ and `functionName` set to `"feePercentage"`
 */
export const useReadConnectoProtocolFeePercentage =
  /*#__PURE__*/ createUseReadContract({
    abi: connectoProtocolAbi,
    functionName: 'feePercentage',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link connectoProtocolAbi}__ and `functionName` set to `"owner"`
 */
export const useReadConnectoProtocolOwner = /*#__PURE__*/ createUseReadContract(
  { abi: connectoProtocolAbi, functionName: 'owner' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link connectoProtocolAbi}__
 */
export const useWriteConnectoProtocol = /*#__PURE__*/ createUseWriteContract({
  abi: connectoProtocolAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link connectoProtocolAbi}__ and `functionName` set to `"claim"`
 */
export const useWriteConnectoProtocolClaim =
  /*#__PURE__*/ createUseWriteContract({
    abi: connectoProtocolAbi,
    functionName: 'claim',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link connectoProtocolAbi}__ and `functionName` set to `"donate"`
 */
export const useWriteConnectoProtocolDonate =
  /*#__PURE__*/ createUseWriteContract({
    abi: connectoProtocolAbi,
    functionName: 'donate',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link connectoProtocolAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteConnectoProtocolInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: connectoProtocolAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link connectoProtocolAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteConnectoProtocolRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: connectoProtocolAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link connectoProtocolAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteConnectoProtocolTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: connectoProtocolAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link connectoProtocolAbi}__
 */
export const useSimulateConnectoProtocol =
  /*#__PURE__*/ createUseSimulateContract({ abi: connectoProtocolAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link connectoProtocolAbi}__ and `functionName` set to `"claim"`
 */
export const useSimulateConnectoProtocolClaim =
  /*#__PURE__*/ createUseSimulateContract({
    abi: connectoProtocolAbi,
    functionName: 'claim',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link connectoProtocolAbi}__ and `functionName` set to `"donate"`
 */
export const useSimulateConnectoProtocolDonate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: connectoProtocolAbi,
    functionName: 'donate',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link connectoProtocolAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateConnectoProtocolInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: connectoProtocolAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link connectoProtocolAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateConnectoProtocolRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: connectoProtocolAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link connectoProtocolAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateConnectoProtocolTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: connectoProtocolAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link connectoProtocolAbi}__
 */
export const useWatchConnectoProtocolEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: connectoProtocolAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link connectoProtocolAbi}__ and `eventName` set to `"Donated"`
 */
export const useWatchConnectoProtocolDonatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: connectoProtocolAbi,
    eventName: 'Donated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link connectoProtocolAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchConnectoProtocolInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: connectoProtocolAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link connectoProtocolAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchConnectoProtocolOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: connectoProtocolAbi,
    eventName: 'OwnershipTransferred',
  })
