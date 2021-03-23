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
const { proto_path, out_dir = '', _: files } = yargs
  .usage('node_protoc2 --out_dir output_folder foo.proto')
  .demandCommand(1, 'no protobuf files specified')
  .option('proto_path', {
    alias: 'I',
    type: 'string',
    description: 'the root of your project',
  })
  .option('out_dir', {
    demandOption: true,
    alias: 'O',
    type: 'string',
    description: 'output directory for generated files',
  }).argv;

compile({ proto_files: files as string[], proto_path, out_dir });
