import ROOT

# ROOT.TGeoManager.Import("geo.root")
ROOT.TGeoManager.Import("detector_geo_full.root")
ROOT.gGeoManager.DefaultColors()
drich_volume =  ROOT.gGeoManager.GetVolume("DRICH")
drich_volume.SetVisOnly(ROOT.kTRUE)   # Set mother volume invisible
drich_volume.Export("drich.root")
