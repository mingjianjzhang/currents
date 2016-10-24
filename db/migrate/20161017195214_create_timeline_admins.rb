class CreateTimelineAdmins < ActiveRecord::Migration
  def change
    create_table :timeline_admins do |t|
      t.references :timeline, index: true
      t.references :admin, index: true

      t.timestamps null: false
    end
    add_foreign_key :timeline_admins, :timelines
    add_foreign_key :timeline_admins, :admins
  end
end
