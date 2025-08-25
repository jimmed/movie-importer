{ mkBunDerivation, ... }:
mkBunDerivation {
  pname = "movie-importer";
  version = "1.0.0";

  src = ./.;

  bunNix = ./bun.nix;

  index = "index.ts";

  buildFlags = [
    "--compile"
    "--minify"
  ];
}
