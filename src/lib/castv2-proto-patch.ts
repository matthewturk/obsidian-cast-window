import * as protobuf from "protobufjs";

const protoStr = `
syntax = "proto2";
package extensions.api.cast_channel;

message CastMessage {
  enum ProtocolVersion {
    CASTV2_1_0 = 0;
  }
  required ProtocolVersion protocol_version = 1;
  required string source_id = 2;
  required string destination_id = 3;
  required string namespace = 4;
  enum PayloadType {
    STRING = 0;
    BINARY = 1;
  }
  required PayloadType payload_type = 5;
  optional string payload_utf8 = 6;
  optional bytes payload_binary = 7;
}

message AuthChallenge {
}

message AuthResponse {
  required bytes signature = 1;
  required bytes client_auth_certificate = 2;
  repeated bytes client_ca = 3;
}

message AuthError {
  enum ErrorType {
    INTERNAL_ERROR = 0;
    NO_TLS = 1;
  }
  required ErrorType error_type = 1;
}

message DeviceAuthMessage {
  optional AuthChallenge challenge = 1;
  optional AuthResponse response = 2;
  optional AuthError error = 3;
}
`;

console.debug("CastV2 Proto Patch Active");
const root = protobuf.parse(protoStr).root;
const castPackage = root.lookup(
	"extensions.api.cast_channel"
) as protobuf.Namespace;

function createMessage(typeName: string) {
	const type = castPackage.lookupType(typeName);
	return {
		// We use 'any' here because protobufjs methods require specific types
		// that 'unknown' cannot satisfy without complex casting.
		serialize: function (data: unknown) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return type
				.encode(type.fromObject(data as { [k: string]: any }))
				.finish();
		},
		parse: function (data: unknown) {
			return type.decode(data as Uint8Array);
		},
	};
}

export const CastMessage = createMessage("CastMessage");
export const AuthChallenge = createMessage("AuthChallenge");
export const AuthResponse = createMessage("AuthResponse");
export const AuthError = createMessage("AuthError");
export const DeviceAuthMessage = createMessage("DeviceAuthMessage");
