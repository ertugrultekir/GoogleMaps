using GoogleHaritalar.WebUI.Models;
using GoogleHaritalar.WebUI.Models.VeriTabani;
using System;
using System.Data.SqlClient;
using System.Security.Principal;
using System.Web.Mvc;

namespace GoogleHaritalar.WebUI.Controllers
{
    public class HomeController : Controller
    {
        NerelereGitti ng = new NerelereGitti();
        SqlConnection cnn = new SqlConnection("Server=.; Database=GoogleHaritalarDB; UID=sa; PWD=123");

        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public JsonResult VeriKayitEt(NerelereGitti ogr)
        {
            string ip = FxFunction.GetClientIp();
            string stringIdTut;
            cnn.Open();
            SqlCommand cmd = new SqlCommand("EXEC dbo.[KayitEkle] @nereden, @nereye, @bilgisayarAdi, @ip", cnn);
            cmd.Parameters.AddWithValue("@nereden", ogr.Nereden);
            cmd.Parameters.AddWithValue("@nereye", ogr.Nereye);
            cmd.Parameters.AddWithValue("@bilgisayarAdi", WindowsIdentity.GetCurrent().Name);
            cmd.Parameters.AddWithValue("@ip", ip);
            stringIdTut = cmd.ExecuteScalar().ToString();

            if (ogr.Nerelere != null)
            {
                int idTut = Convert.ToInt32(stringIdTut);
                for (int i = 0; i < ogr.Nerelere.Length; i++)
                {
                    SqlCommand cmd2 = new SqlCommand("EXEC dbo.[AraNoktaEkle] @araNoktalar, @idTut", cnn);
                    cmd2.Parameters.AddWithValue("@araNoktalar", ogr.Nerelere[i]);
                    cmd2.Parameters.AddWithValue("@idTut", idTut);
                    cmd2.ExecuteNonQuery();
                }
            }
            return Json("", JsonRequestBehavior.AllowGet);
        }
    }
}