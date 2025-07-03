import wallet from "../turbin3-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"

// Create a devnet connection
const umi = createUmi('https://devnet.helius-rpc.com/?api-key=71d05d9f-5d94-4548-9137-c6c3d9f69b3e');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        // Follow this JSON structure
        // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure

        const image = "https://gateway.irys.xyz/9pz4t8AurEKBRzg9RNtqqXaUrKRTjzz6MaR7gyD1gNau"
        const metadata = {
            name: "the PEG RUG",
            symbol: "RER",
            description: "The best of ruggers",
            image,
            attributes: [
                {trait_type: "rarity", value: "shine"}
            ],
            properties: {
                files: [
                    {
                        type: "image/png",
                        uri: image
                    },
                ],
                category: "image",
                creators: [
                    {
                        address: keypair.publicKey.toString(),
                        share: 100
                    }
                ]
            },
            creators: []
        };
        const myUri = await umi.uploader.upload([createGenericFile(JSON.stringify(metadata), "metadata.json",{ contentType: 'application/json' })]);
        console.log("Your metadata URI: ", myUri);
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
