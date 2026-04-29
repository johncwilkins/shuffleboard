namespace BlenderEngineTemplate
{
    public class EngineInputState
    {
        public HashSet<string> KeysDown { get; set; } = new();
        public double MousePixelX { get; set; }
        public double MousePixelY { get; set; }

        public double MouseX { get; set; }
        public double MouseY { get; set; }
        public double MouseZ { get; set; }
        public bool MouseClicked { get; set; }
        public string PickedObjectName { get; set; } = "";
        public string SelectedObjectName { get; set; } = "";
        public bool IsMouseOverCanvas { get; set; }
    }
}
