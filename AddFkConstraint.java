import java.sql.*;
public class AddFkConstraint {
  public static void main(String[] args) throws Exception {
    String url = "jdbc:postgresql://localhost:5432/college";
    String user = "postgres";
    String pass = "tan2003";
    try (Connection c = DriverManager.getConnection(url, user, pass);
         Statement st = c.createStatement()) {
      try {
        st.execute("alter table hods add constraint fk_hods_department_id foreign key (department_id) references departments(id)");
        System.out.println("Foreign key constraint added.");
      } catch (SQLException ex) {
        System.out.println("FK add skipped: " + ex.getMessage());
      }
    }
  }
}
