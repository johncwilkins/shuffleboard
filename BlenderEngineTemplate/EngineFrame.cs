namespace BlenderEngineTemplate
{
    public class EngineFrame
    {
        public List<SceneObjectState> objects { get; set; } = new();
        public CameraState? camera { get; set; }
    }
}
