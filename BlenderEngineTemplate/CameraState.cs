using System.Timers;

namespace BlenderEngineTemplate
{
    public class CameraState
    {
        public double x { get; set; }
        public double y { get; set; }
        public double z { get; set; }

        public double tx { get; set; }
        public double ty { get; set; }
        public double tz { get; set; }

        public double fov { get; set; } = 60;
    }
}
