# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20161028011804) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "admins", force: :cascade do |t|
    t.integer  "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "admins", ["user_id"], name: "index_admins_on_user_id", using: :btree

  create_table "categories", force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "content_nodes", force: :cascade do |t|
    t.string   "title"
    t.string   "link"
    t.text     "description"
    t.integer  "category_id"
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
    t.date     "day"
    t.integer  "source_id"
    t.integer  "image_id",    default: 8
  end

  add_index "content_nodes", ["category_id"], name: "index_content_nodes_on_category_id", using: :btree
  add_index "content_nodes", ["image_id"], name: "index_content_nodes_on_image_id", using: :btree
  add_index "content_nodes", ["source_id"], name: "index_content_nodes_on_source_id", using: :btree

  create_table "content_tags", force: :cascade do |t|
    t.integer  "content_node_id"
    t.integer  "tag_id"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
  end

  add_index "content_tags", ["content_node_id"], name: "index_content_tags_on_content_node_id", using: :btree
  add_index "content_tags", ["tag_id"], name: "index_content_tags_on_tag_id", using: :btree

  create_table "images", force: :cascade do |t|
    t.string   "img_source"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "snapshot_nodes", force: :cascade do |t|
    t.integer  "content_node_id"
    t.integer  "snapshot_id"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
  end

  add_index "snapshot_nodes", ["content_node_id"], name: "index_snapshot_nodes_on_content_node_id", using: :btree
  add_index "snapshot_nodes", ["snapshot_id"], name: "index_snapshot_nodes_on_snapshot_id", using: :btree

  create_table "snapshots", force: :cascade do |t|
    t.string   "title"
    t.integer  "timeline_id"
    t.date     "day"
    t.string   "type"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  add_index "snapshots", ["timeline_id"], name: "index_snapshots_on_timeline_id", using: :btree

  create_table "sources", force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "tags", force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.integer  "timeline_id"
  end

  add_index "tags", ["timeline_id"], name: "index_tags_on_timeline_id", using: :btree

  create_table "timeline_admins", force: :cascade do |t|
    t.integer  "timeline_id"
    t.integer  "admin_id"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.integer  "status"
  end

  add_index "timeline_admins", ["admin_id"], name: "index_timeline_admins_on_admin_id", using: :btree
  add_index "timeline_admins", ["timeline_id"], name: "index_timeline_admins_on_timeline_id", using: :btree

  create_table "timeline_contents", force: :cascade do |t|
    t.integer  "content_node_id"
    t.integer  "timeline_id"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
  end

  add_index "timeline_contents", ["content_node_id"], name: "index_timeline_contents_on_content_node_id", using: :btree
  add_index "timeline_contents", ["timeline_id"], name: "index_timeline_contents_on_timeline_id", using: :btree

  create_table "timeline_users", force: :cascade do |t|
    t.integer  "user_id"
    t.integer  "timeline_id"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.integer  "request"
  end

  add_index "timeline_users", ["timeline_id"], name: "index_timeline_users_on_timeline_id", using: :btree
  add_index "timeline_users", ["user_id"], name: "index_timeline_users_on_user_id", using: :btree

  create_table "timelines", force: :cascade do |t|
    t.string   "title"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.string   "first_name"
    t.string   "last_name"
    t.string   "email"
    t.string   "password_digest"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
    t.string   "username"
  end

  add_foreign_key "admins", "users"
  add_foreign_key "content_nodes", "categories"
  add_foreign_key "content_nodes", "images"
  add_foreign_key "content_nodes", "sources"
  add_foreign_key "content_tags", "content_nodes"
  add_foreign_key "content_tags", "tags"
  add_foreign_key "snapshot_nodes", "content_nodes"
  add_foreign_key "snapshot_nodes", "snapshots"
  add_foreign_key "snapshots", "timelines"
  add_foreign_key "tags", "timelines"
  add_foreign_key "timeline_admins", "admins"
  add_foreign_key "timeline_admins", "timelines"
  add_foreign_key "timeline_contents", "content_nodes"
  add_foreign_key "timeline_contents", "timelines"
  add_foreign_key "timeline_users", "timelines"
  add_foreign_key "timeline_users", "users"
end
