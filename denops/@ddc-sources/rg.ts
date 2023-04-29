import { BaseSource, Item } from "https://deno.land/x/ddc_vim@v3.4.0/types.ts";
import { Denops, fn } from "https://deno.land/x/ddc_vim@v3.4.0/deps.ts";

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
      cmd[0], {
        args: cmd.slice(1),
      }
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
