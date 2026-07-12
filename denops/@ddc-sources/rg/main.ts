import type { Item } from "@shougo/ddc-vim/types";
import { BaseSource } from "@shougo/ddc-vim/source";

import type { Denops } from "@denops/std";
import * as fn from "@denops/std/function";

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

    function escapeRegExp(str: string): string {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    const input = escapeRegExp(args.completeStr);

    const cmd = [
      args.sourceParams.cmd,
      ...args.sourceParams.args,
      input + "[a-zA-Z0-9_-]+",
      cwd,
    ];

    const command = new Deno.Command(cmd[0], {
      args: cmd.slice(1),
      stdout: "piped",
      stderr: "piped",
    });

    const proc = command.spawn();

    const [stdout, stderr, status] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.status,
    ]);

    // NOTE: 1 means no matches in ripgrep
    if (!status.success && status.code >= 2) {
      console.error("[ddc-rg] rg exited with non-zero status");
      if (stderr.length > 0) {
        console.error(stderr);
      }
      return [];
    }

    const items = [...new Set(stdout.split(/\r?\n/))]
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
