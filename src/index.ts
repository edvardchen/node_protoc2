import { exec } from 'child_process';
import globby from 'globby';
import addTypeAnnotation from './utils/add_type_annotation';
import tmp from 'tmp';
import { promisify } from 'util';
import path from 'path';
import { debug, info } from './utils/log';

type Options = {
  legacy_grpc?: boolean;
  out_dir: string;
  proto_files: string[];
  proto_path?: string;
};

function tempPath(temp_dir: string, file: string, proto_path?: string) {
  return path.join(temp_dir, path.relative(proto_path || '.', file));
}

/**
 * main
 */
export default async ({
  proto_files,
  out_dir,
  proto_path,
  legacy_grpc,
}: Options) => {
  const dir = await promisify(tmp.dir)();

  const modified = new Set();

  if (proto_path) {
    for await (const item of globby.stream(
      path.join(proto_path, '/**/*.proto')
    )) {
      const file = item as string;
      modified.add(path.resolve(file));
      await addTypeAnnotation(file, tempPath(dir, file, proto_path));
    }
  }

  const jobs = proto_files.map(async (file) => {
    const target = tempPath(dir, file, proto_path);
    if (modified.has(path.resolve(file))) {
      debug(`skip moving ${file}`);
    } else {
      await addTypeAnnotation(file, target);
    }
    return target;
  });

  const files = await Promise.all(jobs);

  return compile({
    legacy_grpc,
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
async function compile({
  proto_files,
  legacy_grpc,
  out_dir,
  proto_path,
}: Options) {
  const PROTOC_GEN_TS_PATH = require.resolve('ts-protoc-gen/bin/protoc-gen-ts');
  const GRPC_TOOLS_PATH = require.resolve('grpc-tools/bin/protoc.js');
  const args = [
    GRPC_TOOLS_PATH,
    proto_path && `--proto_path=${proto_path}`,
    `--plugin="protoc-gen-ts=${PROTOC_GEN_TS_PATH}"`,
    `--js_out="import_style=commonjs,binary:${out_dir}"`,
    `--ts_out="service=grpc-node${
      !legacy_grpc ? ',mode=grpc-js' : ''
    }:${out_dir}"`,
    `--grpc_out="${!legacy_grpc ? 'grpc_js:' : ''}${out_dir}"`,
    ...proto_files,
  ].filter(Boolean);
  const command = args.join(' ');
  info(`ready to run: ${command}`);
  return new Promise((resolve, reject) => {
    const child_proc = exec(command, (error) => {
      error ? reject(error) : resolve(undefined);
    });
    child_proc.stdout?.pipe(process.stdout);
    child_proc.stderr?.pipe(process.stderr);
  });
}
