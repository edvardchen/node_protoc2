# node_protoc_2

Wrap [grpc-tools](https://github.com/grpc/grpc-node/tree/master/packages/grpc-tools) with additional ability that compile protobuf 64-int types to string automatically

## Why

The [official](https://developers.google.com/protocol-buffers/docs/proto#scalar) table that shows the type specified in the `.proto` file and the corresponding type in target program language doesn't include the JavaScript example. So here is:

| .proto Type                                         | JavaScript                                                                                                |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| double, float, int32,uint32,sint32,fixed32,sfixed32 | number                                                                                                    |
| int64,uint64,sint64,fixed64,sfixed64                | number (maybe overflow)                                                                                   |
| bool                                                | boolean                                                                                                   |
| string                                              | string                                                                                                    |
| byte                                                | [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) |

By default the official compiler `protoc` will compile all protobuf `64-int` types into the JavaScript number type that maybe would cause overflow.

To work around this, you need to adding `jstype` annotation for every `64-int` field because `protoc` doesn't provide any global compile option. Somehow this is annoying when the `.proto` files are not maintained by other teams.

So, I wrote this tool to make it easy.

## Usage

You can generate static codes in JavaScript from `.proto` files through the following command:

```bash
npx node_protoc2 --out-dir output_folder foo.proto
```

All proto `64-int` types would be compiled into JavaScript `string` type
