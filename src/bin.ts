import yargs from 'yargs';
import compile from '.';

// grpc_tools_node_protoc \
//   --proto_path=... \
//   --plugin="protoc-gen-ts=${PROTOC_GEN_TS_PATH}" \
//   --js_out="import_style=commonjs,binary:${OUT_DIR}" \
//   --ts_out="service=grpc-node,mode=grpc-js:${OUT_DIR}" \
//   --grpc_out="grpc_js:${OUT_DIR}" \
//   ...
// out_dir required, default value just to pass type-checking
const { proto_path = [], out_dir = '', legacy_grpc, _: files } = yargs
  .parserConfiguration({
    // make our command behave similarly to protoc
    // If users want to specify multiple proto paths, they must pass multiple path WITH THE SAME KEY
    // BTW, it's difficult to find this option https://github.com/yargs/yargs-parser#greedy-arrays
    'greedy-arrays': false,
  })
  .usage('node_protoc2 --out_dir output_folder foo.proto')
  .demandCommand(1, 'no protobuf files specified')
  .option('proto_path', {
    alias: 'I',
    string: true,
    type: 'array',
    description: 'the folders to search proto files',
  })
  .options('legacy_grpc', {
    type: 'boolean',
    description: 'use legacy package grpc instead of @grpc/grpc-js',
  })
  .option('out_dir', {
    demandOption: true,
    alias: 'O',
    type: 'string',
    description: 'output directory for generated files',
  }).argv;

compile({
  proto_files: files as string[],
  proto_paths: proto_path,
  out_dir,
  legacy_grpc,
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
