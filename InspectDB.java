import java.sql.*;
public class InspectDB {
  public static void main(String[] args) throws Exception {
    String url = "jdbc:postgresql://localhost:5432/college";
    String user = "postgres";
    String pass = ur pass";
    try (Connection c = DriverManager.getConnection(url,user,pass);
         Statement st = c.createStatement()) {
      ResultSet rs = st.executeQuery("select department from hods where department not in (select name from departments);");
      while (rs.next()) System.out.println(rs.getString(1));
    }
  }
}
