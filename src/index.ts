import { exec } from 'child_process';
import addTypeAnnotation from './utils/add_type_annotation';
import tmp from 'tmp';
import { promisify } from 'util';
import path from 'path';
import log from './utils/log';

type Options = {
  out_dir: string;
  proto_files: string[];
  proto_path?: string;
};

export default async ({ proto_files, out_dir, proto_path }: Options) => {
  const dir = await promisify(tmp.dir)();

  const jobs = proto_files
    .map((file) => ({
      original: file,
      target: path.join(dir, path.relative(proto_path || '.', file)),
    }))
    .map(({ original, target }) =>
      addTypeAnnotation(original, target).then(() => target)
    );

  const files = await Promise.all(jobs);

  return compile({
    proto_files: files,
    out_dir,
    proto_path: dir,
  });
};

// grpc_tools_node_protoc \
//   --proto_path=... \
//   --plugin="protoc-gen-ts=${PROTOC_GEN_TS_PATH}" \
//   --js_out="import_style=commonjs,binary:${OUT_DIR}" \
//   --ts_out="service=grpc-node,mode=grpc-js:${OUT_DIR}" \
//   --grpc_out="grpc_js:${OUT_DIR}" \
//   ...
async function compile({ proto_files, out_dir, proto_path }: Options) {
  const PROTOC_GEN_TS_PATH = require.resolve('ts-protoc-gen/bin/protoc-gen-ts');
  const GRPC_TOOLS_PATH = require.resolve('grpc-tools/bin/protoc.js');
  const args = [
    GRPC_TOOLS_PATH,
    `--proto_path=${proto_path}`,
    `--plugin="protoc-gen-ts=${PROTOC_GEN_TS_PATH}"`,
    `--js_out="import_style=commonjs,binary:${out_dir}"`,
    `--ts_out="service=grpc-node,mode=grpc-js:${out_dir}"`,
    `--grpc_out="grpc_js:${out_dir}"`,
    ...proto_files,
  ];
  const command = args.join(' ');
  log(`ready to run: ${command}`);
  return new Promise((resolve, reject) => {
    const child_proc = exec(command, (error) => {
      error ? reject(error) : resolve(undefined);
    });
    child_proc.stdout?.pipe(process.stdout);
    child_proc.stderr?.pipe(process.stderr);
  });
}
