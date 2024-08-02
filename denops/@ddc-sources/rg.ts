import { BaseSource, type Item } from "jsr:@shougo/ddc-vim@6.0.0/types";

import type { Denops } from "jsr:@denops/core@^7.0.0";
import * as fn from "jsr:@denops/std@7.0.1/function";

type Params = {
  cmd: string;
  args: string[];
};

export class Source extends BaseSource<Params> {
  override async gather(args: {
    denops: Denops;
    completeStr: string;
    sourceParams: Params;
  }): Promise<Item[]> {
    const cwd = await fn.getcwd(args.denops) as string;
    const input = args.completeStr.replaceAll(/([\\\[\]^$.*])/g, "\\$1");
    const cmd = [args.sourceParams.cmd].concat(
      args.sourceParams.args,
    ).concat([input + "[a-zA-Z0-9_-]+", cwd]);

    const command = new Deno.Command(
      cmd[0],
      {
        args: cmd.slice(1),
      },
    );

    const { stdout } = await command.output();

    const lines = new TextDecoder().decode(stdout).split(/\r?\n/);
    const items = [...new Set(lines)]
      .filter((line) => line.length != 0)
      .map((word: string) => ({ word }));

    return items;
  }

  override params(): Params {
    return {
      cmd: "rg",
      args: [
        "--no-filename",
        "--no-heading",
        "--no-line-number",
        "--color",
        "never",
        "--only-matching",
        "--word-regexp",
        "--ignore-case",
      ],
    };
  }
}
