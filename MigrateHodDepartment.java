import java.sql.*;
public class MigrateHodDepartment {
  public static void main(String[] args) throws Exception {
    String url = "jdbc:postgresql://localhost:5432/college";
    String user = "postgres";
    String pass = "tan2003";
    try (Connection c = DriverManager.getConnection(url, user, pass);
         Statement st = c.createStatement()) {
      String[] statements = new String[] {
        "alter table hods add column if not exists department_id bigint",
        "insert into departments (name) select distinct trim(department) from hods h where h.department is not null and trim(h.department) <> '' and lower(trim(h.department)) not in (select lower(name) from departments)",
        "update hods set department_id = d.id from departments d where lower(trim(hods.department)) = lower(trim(d.name))",
        "update hods set department_id = department::bigint from hods h where hods.department ~ '^[0-9]+$' and department::bigint in (select id from departments)",
        "alter table hods alter column department_id set not null",
        "alter table hods add constraint if not exists fk_hods_department_id foreign key (department_id) references departments(id)"
      };
      for (String sql : statements) {
        try {
          st.execute(sql);
          System.out.println("Executed: " + sql);
        } catch (SQLException ex) {
          System.out.println("Skipped/failed: " + sql + " -> " + ex.getMessage());
        }
      }
      ResultSet rs = st.executeQuery("select id, department, department_id from hods order by id");
      while(rs.next()) {
        System.out.println(rs.getLong(1) + " | " + rs.getString(2) + " | " + rs.getObject(3));
      }
      System.out.println("Unmatched departments:");
      rs = st.executeQuery("select department from hods where department_id is null and department is not null");
      while(rs.next()) System.out.println(rs.getString(1));
    }
  }
}
