{
  description = "Movie importer for Notion";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    systems.url = "github:nix-systems/default";

    bun2nix.url = "github:baileyluTCD/bun2nix?tag=1.5.1";
    bun2nix.inputs.nixpkgs.follows = "nixpkgs";
    bun2nix.inputs.systems.follows = "systems";
  };

  outputs =
    {
      nixpkgs,
      systems,
      bun2nix,
      ...
    }:
    let
      # Read each system from the nix-systems input
      eachSystem = nixpkgs.lib.genAttrs (import systems);

      # Access the package set for a given system
      pkgsFor = eachSystem (system: import nixpkgs { inherit system; });
    in
    {
      packages = eachSystem (system: {
        # Produce a package for this template with bun2nix
        default = pkgsFor.${system}.callPackage ./default.nix {
          inherit (bun2nix.lib.${system}) mkBunDerivation;
        };
      });

      devShells = eachSystem (system: {
        default = pkgsFor.${system}.mkShell {
          packages = with pkgsFor.${system}; [
            bun

            # Add the bun2nix binary to our devshell
            bun2nix.packages.${system}.default
          ];

          shellHook = ''
            bun install --frozen-lockfile
          '';
        };
      });
    };
}
