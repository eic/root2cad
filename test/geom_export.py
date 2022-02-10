import ROOT

def export_volume(vol_name, output_name):
    volume = ROOT.gGeoManager.GetVolume(vol_name)
    volume.SetVisOnly(ROOT.kTRUE)   # Set mother volume invisible
    volume.Export(output_name)


# ROOT.TGeoManager.Import("geo.root")
ROOT.TGeoManager.Import("detector_geo_full.root")
ROOT.gGeoManager.DefaultColors()
drich_volume =  ROOT.gGeoManager.GetVolume("DRICH")
drich_volume.SetVisOnly(ROOT.kTRUE)   # Set mother volume invisible
drich_volume.Export("drich.root")

b0tracker =  ROOT.gGeoManager.GetVolume("B0Tracker")
b0tracker.SetVisOnly(ROOT.kTRUE)   # Set mother volume invisible
b0tracker.Export("b0tracker.root")

b0ps =  ROOT.gGeoManager.GetVolume("B0Preshower")
b0ps.SetVisOnly(ROOT.kTRUE)   # Set mother volume invisible
b0ps.Export("b0preshower.root")

zdc_ecal =  ROOT.gGeoManager.GetVolume("ffi_ZDC_ECAL_envelope")
zdc_ecal.SetVisOnly(ROOT.kTRUE)   # Set mother volume invisible
zdc_ecal.Export("zdc_ecal.root")

zdc_hcal =  ROOT.gGeoManager.GetVolume("ffi_ZDC_HCAL_envelope")
zdc_hcal.SetVisOnly(ROOT.kTRUE)   # Set mother volume invisible
zdc_hcal.Export("zdc_hcal.root")



export_volume("ForwardOffMTracker_station_1", "offm_tracker_station_1.root")
export_volume("ForwardOffMTracker_station_2", "offm_tracker_station_2.root")
export_volume("ForwardOffMTracker_station_3", "offm_tracker_station_3.root")
export_volume("ForwardOffMTracker_station_4", "offm_tracker_station_4.root")
export_volume("ForwardRomanPot_Station_1", "roman_pot_station_1.root")
export_volume("ForwardRomanPot_Station_2", "roman_pot_station_2.root")

# drich_volume.Draw("ogl")
# input("hello")
#t = ROOT.TBrowser()
