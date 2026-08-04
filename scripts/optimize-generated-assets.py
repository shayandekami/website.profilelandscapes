from pathlib import Path

from PIL import Image


ASSETS = {
    Path(
        r"C:\Users\James\.codex\generated_images\019f8c91-f821-79e3-ae74-72b95ac7395d"
        r"\call_bXwOYEWgfK8Kf9HKsmD1muFs.png"
    ): Path(r"C:\Apps\profilelandscapes\public\assets\generated\nursery-hero.webp"),
    Path(
        r"C:\Users\James\.codex\generated_images\019f8c91-f821-79e3-ae74-72b95ac7395d"
        r"\call_TnOoQs2GM4upvxUV1pEUMTKY.png"
    ): Path(r"C:\Apps\profilelandscapes\public\assets\generated\field-shop-hero.webp"),
    Path(
        r"C:\Users\James\.codex\generated_images\019f8c91-f821-79e3-ae74-72b95ac7395d"
        r"\call_GUzAQKcJ2ETxJ7Xn9bAoY6jW.png"
    ): Path(r"C:\Apps\profilelandscapes\public\assets\generated\about-team.webp"),
    Path(
        r"C:\Users\James\.codex\generated_images\019f8c91-f821-79e3-ae74-72b95ac7395d"
        r"\call_H7HUwIiQL7VKeEDeITXutigi.png"
    ): Path(r"C:\Apps\profilelandscapes\public\assets\generated\shop-workwear.webp"),
    Path(
        r"C:\Users\James\.codex\generated_images\019f8c91-f821-79e3-ae74-72b95ac7395d"
        r"\call_ZedsBMIdciGU4Suo5hshbHky.png"
    ): Path(r"C:\Apps\profilelandscapes\public\assets\generated\shop-gloves.webp"),
    Path(
        r"C:\Users\James\.codex\generated_images\019f8c91-f821-79e3-ae74-72b95ac7395d"
        r"\call_rK6sf9D6xHOZq3sG0oTvRC86.png"
    ): Path(r"C:\Apps\profilelandscapes\public\assets\generated\shop-tools.webp"),
    Path(
        r"C:\Users\James\.codex\generated_images\019f8c91-f821-79e3-ae74-72b95ac7395d"
        r"\call_nPAAA3mk1gOGKqGthtDpzEcW.png"
    ): Path(r"C:\Apps\profilelandscapes\public\assets\generated\shop-home-garden.webp"),
    Path(r"C:\Users\James\.codex\generated_images\019f8c91-f821-79e3-ae74-72b95ac7395d\call_zftatBXDsCPK05EUvWurKrBh.png"):
        Path(r"C:\Apps\profilelandscapes\public\assets\generated\plants-screening.webp"),
    Path(r"C:\Users\James\.codex\generated_images\019f8c91-f821-79e3-ae74-72b95ac7395d\call_910GWwPLhnHXpWDmz2YFaC2O.png"):
        Path(r"C:\Apps\profilelandscapes\public\assets\generated\plants-drought.webp"),
    Path(r"C:\Users\James\.codex\generated_images\019f8c91-f821-79e3-ae74-72b95ac7395d\call_dOohze3C7UbxwKIhltb2NKZc.png"):
        Path(r"C:\Apps\profilelandscapes\public\assets\generated\plants-groundcover.webp"),
    Path(r"C:\Users\James\.codex\generated_images\019f8c91-f821-79e3-ae74-72b95ac7395d\call_7NiAOpI61zSwmeWfIU1DMNYt.png"):
        Path(r"C:\Apps\profilelandscapes\public\assets\generated\plants-hedging.webp"),
    Path(r"C:\Users\James\.codex\generated_images\019f8c91-f821-79e3-ae74-72b95ac7395d\call_3V9vRJgUjsnbcdoW5zrAVMSC.png"):
        Path(r"C:\Apps\profilelandscapes\public\assets\generated\plants-fragrant.webp"),
    Path(r"C:\Users\James\.codex\generated_images\019f8c91-f821-79e3-ae74-72b95ac7395d\call_GLAQZ7Cb4NuzrFYzSbu8wX4N.png"):
        Path(r"C:\Apps\profilelandscapes\public\assets\generated\placeholder-tree.webp"),
    Path(r"C:\Users\James\.codex\generated_images\019f8c91-f821-79e3-ae74-72b95ac7395d\call_ulW5fJfkT84ek7iB9mgqFH2z.png"):
        Path(r"C:\Apps\profilelandscapes\public\assets\generated\placeholder-shrub.webp"),
    Path(r"C:\Users\James\.codex\generated_images\019f8c91-f821-79e3-ae74-72b95ac7395d\call_e9P1geN4MOmJyZwFsfzDJZs7.png"):
        Path(r"C:\Apps\profilelandscapes\public\assets\generated\placeholder-grass.webp"),
    Path(r"C:\Users\James\.codex\generated_images\019f8c91-f821-79e3-ae74-72b95ac7395d\call_cBbLwvKwRwH86YNfp4pbArp6.png"):
        Path(r"C:\Apps\profilelandscapes\public\assets\generated\placeholder-groundcover.webp"),
}


for source, destination in ASSETS.items():
    destination.parent.mkdir(parents=True, exist_ok=True)
    image = Image.open(source).convert("RGB")
    image.thumbnail((1600, 1200), Image.Resampling.LANCZOS)
    image.save(destination, "WEBP", quality=76, method=6)
    print(f"{destination.name}: {image.width}x{image.height}, {destination.stat().st_size} bytes")
