import fs, { createReadStream, createWriteStream } from 'fs';
import path from 'path';
import { pipeline, Transform, TransformOptions } from 'stream';
import { promisify } from 'util';
import { LineStream } from 'byline';
import _ from 'lodash';

const qPipeline = promisify(pipeline);

/**
 * modify content when copying file
 */
export default async function modifyOnCopy(
  original: string,
  target: string,
  transform: NonNullable<TransformOptions['transform']>
) {
  await fs.promises.mkdir(path.dirname(target), { recursive: true });

  return qPipeline(
    createReadStream(original, { encoding: 'utf8' }),
    // I'm a lazy man, just use the 3rd library to read stream line by line
    new LineStream(),
    new Transform({
      decodeStrings: false,
      transform(chunk, enc, callback) {
        transform.call(this, chunk, enc, (error, data) => {
          // FIXME: maybe \n not proper for all OS
          // restore line separator
          callback(error, data && data + '\n');
        });
      },
    }),
    createWriteStream(target)
  );
}
