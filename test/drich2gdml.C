void drich2gdml()
{
    gSystem->Load("libGeom");
    auto volume = (TGeoVolume*)TFile("drich.root").Get("DRICH");
    
    auto gGeoManager = new TGeoManager();
    gGeoManager->SetTopVolume(volume);
    gGeoManager->Export("drich.gdml");
    
}