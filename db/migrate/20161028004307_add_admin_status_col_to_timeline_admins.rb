class AddAdminStatusColToTimelineAdmins < ActiveRecord::Migration
  def change
    add_column :timeline_admins, :status, :integer
  end
end
